const Razorpay = require('razorpay');
const crypto   = require('crypto');
const prisma   = require('../config/db');
const { createError } = require('../middleware/errorMiddleware');
const { getOrCreateSettings } = require('./settingsController');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
const createPaymentOrder = async (req, res, next) => {
  try {
    const { items, customerName, email, phone, address, city, state, pincode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(createError('Cart is empty', 400));
    }

    // ── Calculate total from DB (NEVER trust frontend prices) ──
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId, active: true },
        include: { sizes: true },
      });
      if (!product) return next(createError(`Product not found: ${item.productId}`, 400));

      let price = product.price;
      if (item.selectedSize) {
        const sizeData = product.sizes.find(s => s.size === item.selectedSize);
        if (!sizeData) return next(createError(`Invalid size for ${product.name}`, 400));
        price = sizeData.price;
      }

      if (product.stock < item.quantity) {
        return next(createError(`Insufficient stock for ${product.name}`, 400));
      }

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        selectedSize: item.selectedSize || null,
        quantity: item.quantity,
        price,
      });

      subtotal += price * item.quantity;
    }

    const settings = await getOrCreateSettings();
    const deliveryCharge = subtotal >= settings.freeDeliveryAbove ? 0 : settings.deliveryCharge;
    const totalAmount = subtotal + deliveryCharge;
    const amountInPaise = Math.round(totalAmount * 100);

    // ── Create Razorpay order ──────────────────────────────
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    // ── Temporarily store pending order data (we create DB order after payment verification) ──
    // Store in a temp payment record linking razorpayOrderId to cart details
    // The actual Order row is only created after verification
    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      // Send back validated totals for display
      subtotal,
      deliveryCharge,
      totalAmount,
      // Echo back validated items (for frontend display only)
      items: validatedItems,
      customerInfo: { customerName, email, phone, address, city, state, pincode },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/verify
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items,
      customerName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
    } = req.body;

    // ── Verify signature ───────────────────────────────────
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return next(createError('Payment verification failed: invalid signature', 400));
    }

    // ── Recalculate total from DB one more time ────────────
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId, active: true },
        include: { sizes: true },
      });
      if (!product) return next(createError(`Product not found: ${item.productId}`, 400));

      let price = product.price;
      if (item.selectedSize) {
        const sizeData = product.sizes.find(s => s.size === item.selectedSize);
        if (sizeData) price = sizeData.price;
      }

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        selectedSize: item.selectedSize || null,
        quantity: item.quantity,
        price,
      });

      subtotal += price * item.quantity;
    }

    const settings = await getOrCreateSettings();
    const deliveryCharge = subtotal >= settings.freeDeliveryAbove ? 0 : settings.deliveryCharge;
    const totalAmount = subtotal + deliveryCharge;

    // ── Check for duplicate payment ────────────────────────
    const existingPayment = await prisma.payment.findFirst({
      where: { razorpayPaymentId },
    });
    if (existingPayment) {
      return next(createError('Payment already processed', 400));
    }

    // ── Create Order + OrderItems + Payment in a transaction ─
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user?.id || null,
          totalAmount,
          deliveryCharge,
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
          customerName,
          email,
          phone,
          address,
          city,
          state,
          pincode,
          items: {
            create: validatedItems.map(i => ({
              productId: i.productId,
              productName: i.productName,
              selectedSize: i.selectedSize,
              quantity: i.quantity,
              price: i.price,
            })),
          },
          payment: {
            create: {
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature,
              amount: totalAmount,
              status: 'PAID',
            },
          },
        },
        include: { items: true, payment: true },
      });

      // ── Decrement stock ──────────────────────────────────
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        if (item.selectedSize) {
          await tx.productSize.updateMany({
            where: { productId: item.productId, size: item.selectedSize },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    res.json({
      message: 'Payment successful! Order placed.',
      orderId: order.id,
      order,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/webhook — Razorpay webhook handler
const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === 'payment.failed') {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: { status: 'FAILED' },
      });
      await prisma.order.updateMany({
        where: { payment: { razorpayOrderId } },
        data: { paymentStatus: 'FAILED' },
      });
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPaymentOrder, verifyPayment, handleWebhook };
