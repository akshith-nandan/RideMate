const mongoose = require('mongoose');
const RideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  startLocation: {
    type: String,
    required: [true, 'Start location is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  routePoints: {
    type: [String],
    required: [true, 'Route transit stops are required'],
    validate: {
      validator: function(v) {
        return v && v.length >= 2;
      },
      message: 'Route must have at least a start and an end point.'
    }
  },
  departureTime: {
    type: Date,
    required: [true, 'Departure time is required']
  },
  costPerSeat: {
    type: Number,
    required: [true, 'Cost per seat is required'],
    min: [0, 'Cost cannot be negative']
  },
  availableSeats: {
    type: Number,
    required: [true, 'Available seats is required'],
    min: [1, 'Must offer at least 1 seat']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('Ride', RideSchema);
