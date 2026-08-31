const prisma = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { createError } = require('../middleware/errorMiddleware');

// ── Public ───────────────────────────────────────────────

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, minPrice, maxPrice, inStock, page = 1, limit = 20 } = req.query;

    const where = { active: true };

    if (category) {
      where.category = { slug: category };
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    const orderBy = (() => {
      switch (sort) {
        case 'newest':     return { createdAt: 'desc' };
        case 'price_asc':  return { price: 'asc' };
        case 'price_desc': return { price: 'desc' };
        default:           return { featured: 'desc' };
      }
    })();

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          category: { select: { name: true, slug: true } },
          sizes: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:slug
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: { select: { name: true, slug: true } },
        sizes: true,
      },
    });
    if (!product || !product.active) return next(createError('Product not found', 404));
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// ── Admin ────────────────────────────────────────────────

// GET /api/products/admin/all
const getAdminProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true, slug: true } }, sizes: true },
      }),
      prisma.product.count(),
    ]);
    res.json({ products, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const {
      name, description, price, originalPrice, stock,
      categoryId, featured, active, sizes,
    } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) return next(createError('A product with this name already exists', 400));

    let image = '';
    let cloudinaryId = null;

    if (req.file) {
      if (req.file.path) {
        image = req.file.path;
        cloudinaryId = req.file.filename || null;
      } else if (req.file.buffer) {
        image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    const parsedSizes = sizes ? (typeof sizes === 'string' ? JSON.parse(sizes) : sizes) : [];

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock),
        image,
        cloudinaryId,
        categoryId,
        featured: featured === 'true' || featured === true,
        active: active !== 'false' && active !== false,
        sizes: parsedSizes.length > 0
          ? { create: parsedSizes.map(s => ({ size: s.size, price: parseFloat(s.price), stock: parseInt(s.stock) })) }
          : undefined,
      },
      include: { category: true, sizes: true },
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const {
      name, description, price, originalPrice, stock,
      categoryId, featured, active, sizes,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(createError('Product not found', 404));

    let image = existing.image;
    let cloudinaryId = existing.cloudinaryId;

    if (req.file) {
      if (req.file.path) {
        image = req.file.path;
        cloudinaryId = req.file.filename || null;
      } else if (req.file.buffer) {
        image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    // If a new image was uploaded, delete the old one from Cloudinary
    if (req.file && existing.cloudinaryId) {
      await cloudinary.uploader.destroy(existing.cloudinaryId).catch(() => {});
    }

    const updateData = {
      description,
      price: price ? parseFloat(price) : undefined,
      originalPrice: originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : undefined,
      stock: stock ? parseInt(stock) : undefined,
      categoryId,
      featured: featured !== undefined ? (featured === 'true' || featured === true) : undefined,
      active: active !== undefined ? (active !== 'false' && active !== false) : undefined,
    };

    if (name && name !== existing.name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (req.file) {
      updateData.image = image;
      updateData.cloudinaryId = cloudinaryId;
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
      include: { category: true, sizes: true },
    });

    // Update sizes if provided
    if (sizes) {
      const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      await prisma.productSize.deleteMany({ where: { productId: req.params.id } });
      if (parsedSizes.length > 0) {
        await prisma.productSize.createMany({
          data: parsedSizes.map(s => ({
            productId: req.params.id,
            size: s.size,
            price: parseFloat(s.price),
            stock: parseInt(s.stock),
          })),
        });
      }
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return next(createError('Product not found', 404));

    if (product.cloudinaryId) {
      await cloudinary.uploader.destroy(product.cloudinaryId).catch(() => {});
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductBySlug, getAdminProducts, createProduct, updateProduct, deleteProduct };
