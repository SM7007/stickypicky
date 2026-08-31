require('dotenv').config();
const app = require('./app');

// Export app for Vercel serverless
module.exports = app;

// Start server only when running locally (not on Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 stickypicky server running on port ${PORT}`);
    console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   URL:  http://localhost:${PORT}`);
  });
}
