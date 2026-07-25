const express = require('express');
const router = express.Router();
const { 
  getVerificationStatus,
  uploadProfilePhoto,
  uploadAadhaar,
  uploadDrivingLicense,
  uploadVehicleRegistration
} = require('../controllers/verificationController');
const { protect } = require('../middleware/auth');
const  driverOnly  = require('../middleware/driverOnly');
// Get verification status
router.get('/status', protect, getVerificationStatus);

// Upload documents
router.post('/profile-photo', protect, uploadProfilePhoto);
router.post('/aadhaar', protect, uploadAadhaar);
router.post('/driving-license', protect, driverOnly, uploadDrivingLicense);
router.post('/vehicle-registration', protect, driverOnly, uploadVehicleRegistration);

module.exports = router;
