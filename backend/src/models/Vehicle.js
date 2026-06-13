const mongoose = require('mongoose');
const VehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['bike', 'auto', 'car'],
    required: [true, 'Vehicle type (bike, auto, car) is required']
  },
  number: {
    type: String,
    required: [true, 'Vehicle plate number is required'],
    trim: true,
    uppercase: true
  },
  model: {
    type: String,
    required: [true, 'Vehicle model (e.g., Honda Activa, Swift) is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Vehicle seating capacity is required'],
    min: [1, 'Capacity must be at least 1']
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('Vehicle', VehicleSchema);
