const prisma = require('../config/db');
const { getOrCreateSettings } = require('./settingsController');
const { createError } = require('../middleware/errorMiddleware');

// Cart is stored in DB per user session (server-side cart)

// GET /api/cart  — returns cart items for logged in user
const getCart = async (req, res, next) => {
  try {
    // We derive cart from a CartItem model (not in schema yet — we use session-based cart)
    // For simplicity in v1, frontend manages cart in localStorage/context
    // This endpoint returns validated product info for items
    res.json({ message: 'Cart managed client-side in v1' });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart/validate — validates cart items before checkout
const validateCart = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ productId, selectedSize, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(createError('Cart is empty', 400));
    }

    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { sizes: true },
      });

      if (!product || !product.active) {
        return next(createError(`Product "${item.productId}" is no longer available`, 400));
      }

      let price = product.price;
      let availableStock = product.stock;

      if (item.selectedSize) {
        const sizeData = product.sizes.find(s => s.size === item.selectedSize);
        if (!sizeData) return next(createError(`Size ${item.selectedSize} not available for ${product.name}`, 400));
        price = sizeData.price;
        availableStock = sizeData.stock;
      }

      if (availableStock < item.quantity) {
        return next(createError(`Only ${availableStock} units of "${product.name}" (${item.selectedSize || ''}) in stock`, 400));
      }

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        image: product.image,
        selectedSize: item.selectedSize || null,
        quantity: item.quantity,
        price,
        itemTotal: price * item.quantity,
      });

      subtotal += price * item.quantity;
    }

    const settings = await getOrCreateSettings();
    const deliveryCharge = subtotal >= settings.freeDeliveryAbove ? 0 : settings.deliveryCharge;
    const total = subtotal + deliveryCharge;

    res.json({ items: validatedItems, subtotal, deliveryCharge, total });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, validateCart };
