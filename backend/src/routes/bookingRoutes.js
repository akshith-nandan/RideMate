const express = require('express');
const router = express.Router();
const {
  requestBooking,
  acceptBooking,
  rejectBooking,
  getPassengerBookings,
  getDriverBookings
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
router.post('/request', protect, requestBooking);
router.put('/accept', protect, acceptBooking);
router.put('/reject', protect, rejectBooking);
router.get('/passenger', protect, getPassengerBookings);
router.get('/driver', protect, getDriverBookings);
module.exports = router;