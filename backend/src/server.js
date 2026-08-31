require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 stickypicky server running on port ${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   URL:  http://0.0.0.0:${PORT}`);
});
