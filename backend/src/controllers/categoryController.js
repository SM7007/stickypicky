const prisma = require('../config/db');
const { createError } = require('../middleware/errorMiddleware');

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    // Auto-ensure default Stickers & Polaroids categories exist
    const defaultCategories = [
      { name: 'Stickers', slug: 'stickers' },
      { name: 'Polaroids', slug: 'polaroids' },
    ];
    for (const cat of defaultCategories) {
      const exists = await prisma.category.findUnique({ where: { slug: cat.slug } });
      if (!exists) {
        await prisma.category.create({ data: cat });
      }
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: { where: { active: true } } } } },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return next(createError('Category already exists', 400));
    const category = await prisma.category.create({ data: { name, slug } });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, slug },
    });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const count = await prisma.product.count({ where: { categoryId: req.params.id } });
    if (count > 0) return next(createError('Cannot delete category with existing products', 400));
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
