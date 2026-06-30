const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// Request logging in development
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/ride', rideRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/user', userRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});
// Custom 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});
// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});
module.exports = app;
