const prisma = require('../config/db');
const { createError } = require('../middleware/errorMiddleware');

// GET /api/orders/my — customer's own orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payment: { select: { status: true, razorpayPaymentId: true } },
      },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id — get single order (customer can only see their own)
const getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        payment: true,
      },
    });
    if (!order) return next(createError('Order not found', 404));
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return next(createError('Not authorized to view this order', 403));
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// ── Admin ────────────────────────────────────────────────

// GET /api/orders/admin/all
const getAdminOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { orderStatus: status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payment: { select: { status: true, razorpayPaymentId: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/admin/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(orderStatus)) {
      return next(createError('Invalid order status', 400));
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { orderStatus },
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/admin/stats
const getAdminStats = async (req, res, next) => {
  try {
    const [totalProducts, totalOrders, pendingOrders, completedOrders, revenue] = await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: 'PENDING' } }),
      prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
    ]);

    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: revenue._sum.totalAmount || 0,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyOrders, getOrderById, getAdminOrders, updateOrderStatus, getAdminStats };
