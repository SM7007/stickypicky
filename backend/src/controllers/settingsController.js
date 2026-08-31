const prisma = require('../config/db');

// Helper: get or create settings with defaults
const getOrCreateSettings = async () => {
  return prisma.settings.upsert({
    where: { id: 'site_settings' },
    update: {},
    create: { id: 'site_settings', deliveryCharge: 49, freeDeliveryAbove: 500 },
  });
};

// GET /api/settings  — public (used by cart, checkout, payment)
const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings  — admin only
const updateSettings = async (req, res, next) => {
  try {
    const { deliveryCharge, freeDeliveryAbove } = req.body;

    if (deliveryCharge === undefined && freeDeliveryAbove === undefined) {
      return res.status(400).json({ message: 'Nothing to update.' });
    }

    const data = {};
    if (deliveryCharge    !== undefined) data.deliveryCharge    = parseFloat(deliveryCharge);
    if (freeDeliveryAbove !== undefined) data.freeDeliveryAbove = parseFloat(freeDeliveryAbove);

    const settings = await prisma.settings.upsert({
      where:  { id: 'site_settings' },
      update: data,
      create: {
        id: 'site_settings',
        deliveryCharge:    data.deliveryCharge    ?? 49,
        freeDeliveryAbove: data.freeDeliveryAbove ?? 500,
      },
    });

    res.json({ message: 'Settings updated successfully.', settings });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings, getOrCreateSettings };
