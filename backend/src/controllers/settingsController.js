const prisma = require('../config/db');

// Helper: get or create settings with defaults
const getOrCreateSettings = async () => {
  let settings = await prisma.settings.findUnique({
    where: { id: 'site_settings' }
  });
  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: 'site_settings', deliveryCharge: 49, freeDeliveryAbove: 500 }
    });
  }
  return settings;
};

// Fields accepted by updateSettings
const ALLOWED_FIELDS = ['deliveryCharge', 'freeDeliveryAbove', 'heroImage1', 'heroImage2', 'heroImage3'];

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
    const { deliveryCharge, freeDeliveryAbove, heroImage1, heroImage2, heroImage3 } = req.body;

    // Ensure at least one recognised field is present
    const hasUpdate = ALLOWED_FIELDS.some(f => req.body[f] !== undefined);
    if (!hasUpdate) {
      return res.status(400).json({ message: 'Nothing to update.' });
    }

    const data = {};
    if (deliveryCharge    !== undefined) data.deliveryCharge    = parseFloat(deliveryCharge);
    if (freeDeliveryAbove !== undefined) data.freeDeliveryAbove = parseFloat(freeDeliveryAbove);
    // Hero images — allow empty string to clear an image
    if (heroImage1 !== undefined) data.heroImage1 = heroImage1 || null;
    if (heroImage2 !== undefined) data.heroImage2 = heroImage2 || null;
    if (heroImage3 !== undefined) data.heroImage3 = heroImage3 || null;

    let settings = await prisma.settings.findUnique({
      where: { id: 'site_settings' }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 'site_settings',
          deliveryCharge:    data.deliveryCharge    ?? 49,
          freeDeliveryAbove: data.freeDeliveryAbove ?? 500,
          heroImage1:        data.heroImage1        ?? null,
          heroImage2:        data.heroImage2        ?? null,
          heroImage3:        data.heroImage3        ?? null,
        }
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: 'site_settings' },
        data: data
      });
    }

    res.json({ message: 'Settings updated successfully.', settings });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings, getOrCreateSettings };
