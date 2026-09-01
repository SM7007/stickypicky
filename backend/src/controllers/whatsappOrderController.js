const prisma = require('../config/db');
const { createError } = require('../middleware/errorMiddleware');

// POST /api/whatsapp/order
// Logs the WhatsApp order in DB and returns the wa.me link
const createWhatsappOrder = async (req, res, next) => {
  try {
    const {
      items,
      customerName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
    } = req.body;

    // Basic validation
    if (!items || !items.length) {
      return next(createError('No items in order', 400));
    }
    if (!customerName || !email || !phone || !address || !city || !state || !pincode) {
      return next(createError('All delivery details are required', 400));
    }

    // Fetch product details and calculate totals
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
      include: { sizes: true },
    });

    if (products.length !== productIds.length) {
      return next(createError('One or more products are unavailable', 400));
    }

    // Build order items with resolved prices
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw createError(`Product not found: ${item.productId}`, 400);

      let unitPrice = product.price;
      if (item.selectedSize) {
        const sizeEntry = product.sizes.find((s) => s.size === item.selectedSize);
        if (sizeEntry) unitPrice = sizeEntry.price;
      }

      return {
        productId: product.id,
        productName: product.name,
        selectedSize: item.selectedSize || null,
        quantity: item.quantity,
        price: unitPrice,
      };
    });

    // Fetch site settings for delivery charge
    const settings = await prisma.settings.findUnique({ where: { id: 'site_settings' } });
    const deliveryChargeThreshold = settings?.freeDeliveryAbove ?? 500;
    const deliveryChargeAmount = settings?.deliveryCharge ?? 49;

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryCharge = subtotal >= deliveryChargeThreshold ? 0 : deliveryChargeAmount;
    const totalAmount = subtotal + deliveryCharge;

    // Save order to DB with orderType WHATSAPP
    const order = await prisma.order.create({
      data: {
        customerName,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        totalAmount,
        deliveryCharge,
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        orderType: 'WHATSAPP',
        // Link to user if logged in
        ...(req.user ? { userId: req.user.id } : {}),
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    // Build the WhatsApp message text
    const itemLines = orderItems
      .map((i) => `• ${i.productName} × ${i.quantity}${i.selectedSize ? ` (${i.selectedSize})` : ''} — ₹${(i.price * i.quantity).toFixed(0)}`)
      .join('\n');

    const message = [
      '🛍️ *New Order — StickyPicky*',
      '',
      `👤 *Name:* ${customerName}`,
      `📞 *Phone:* ${phone}`,
      `📧 *Email:* ${email}`,
      '',
      '📦 *Items:*',
      itemLines,
      '',
      `🚚 *Delivery Charge:* ${deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}`,
      `💰 *Total Amount (COD):* ₹${totalAmount.toFixed(0)}`,
      '',
      '📍 *Delivery Address:*',
      `${address}`,
      `${city}, ${state} - ${pincode}`,
      '',
      `🗒️ *Order ID:* ${order.id}`,
      '',
      '_Payment: Cash on Delivery_',
      '_Please confirm this order._',
    ].join('\n');

    const waNumber = process.env.WHATSAPP_NUMBER || '917200670847';
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

    res.status(201).json({ order, waUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = { createWhatsappOrder };
