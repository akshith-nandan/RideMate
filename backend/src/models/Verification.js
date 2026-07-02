const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profilePhoto: {
    url: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: String,
    uploadedAt: Date
  },
  aadhaar: {
    number: String,
    url: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: String,
    uploadedAt: Date
  },
  drivingLicense: {
    number: String,
    url: String,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: String,
    uploadedAt: Date
  },
  vehicleRegistration: {
    number: String,
    url: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: String,
    uploadedAt: Date
  },
  overallStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'incomplete'],
    default: 'incomplete'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  rejectedAt: Date,
  rejectionNotes: String,
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Verification', VerificationSchema);
