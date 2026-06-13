const mongoose = require('mongoose');
const BookingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickup: {
    type: String,
    required: [true, 'Pickup point is required'],
    trim: true
  },
  dropoff: {
    type: String,
    required: [true, 'Drop-off point is required'],
    trim: true
  },
  seatsRequested: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Must request at least 1 seat']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  matchPercentage: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('Booking', BookingSchema);
