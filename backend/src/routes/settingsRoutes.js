const express = require('express');
const router  = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',  getSettings);                      // public
router.put('/',  protect, adminOnly, updateSettings); // admin only

module.exports = router;
