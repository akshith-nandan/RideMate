require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const PORT = process.env.PORT || 5000;
// Initialize Database connection
connectDB();
// Start Express server
const server = app.listen(PORT, () => {
  console.log(`RideMate backend server running on port ${PORT}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});