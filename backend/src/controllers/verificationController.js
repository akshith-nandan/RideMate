const User = require('../models/User');
const Verification = require('../models/Verification');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper to save uploaded file
const saveUploadedFile = (file, folder) => {
  const fileName = `${folder}_${Date.now()}_${file.name}`;
  const filePath = path.join(uploadDir, fileName);
  file.mv(filePath);
  return `/uploads/${fileName}`;
};

// @desc    Get user verification status
// @route   GET /api/verification/status
// @access  Private
const getVerificationStatus = async (req, res) => {
  try {
    let verification = await Verification.findOne({ user: req.user._id });

    if (!verification) {
      verification = await Verification.create({
        user: req.user._id,
        overallStatus: 'incomplete'
      });
    }

    res.json({
      success: true,
      verification
    });
  } catch (error) {
    console.error('Get Verification Status Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error, please try again'
    });
  }
};

// @desc    Upload profile photo
// @route   POST /api/verification/profile-photo
// @access  Private
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.files || !req.files.photo) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a photo'
      });
    }

    const photo = req.files.photo;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(photo.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only JPEG and PNG files are allowed'
      });
    }

    // Validate file size (max 5MB)
    if (photo.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 5MB'
      });
    }

    const photoUrl = saveUploadedFile(photo, 'profile_photo');

    let verification = await Verification.findOne({ user: req.user._id });
    if (!verification) {
      verification = await Verification.create({ user: req.user._id });
    }

    verification.profilePhoto = {
      url: photoUrl,
      status: 'pending',
      uploadedAt: new Date()
    };

    // Update overall status if all documents pending
    verification.overallStatus = 'pending';
    await verification.save();

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      verification
    });
  } catch (error) {
    console.error('Upload Profile Photo Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error, please try again'
    });
  }
};

// @desc    Upload Aadhaar document
// @route   POST /api/verification/aadhaar
// @access  Private
const uploadAadhaar = async (req, res) => {
  try {
    if (!req.files || !req.files.document) {
      return res.status(400).json({
        success: false,
        message: 'Please upload Aadhaar document'
      });
    }

    const { number } = req.body;
    if (!number || number.length !== 12) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid 12-digit Aadhaar number'
      });
    }

    const document = req.files.document;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(document.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF and image files are allowed'
      });
    }

    // Validate file size (max 10MB)
    if (document.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 10MB'
      });
    }

    const documentUrl = saveUploadedFile(document, 'aadhaar');

    let verification = await Verification.findOne({ user: req.user._id });
    if (!verification) {
      verification = await Verification.create({ user: req.user._id });
    }

    verification.aadhaar = {
      number,
      url: documentUrl,
      status: 'pending',
      uploadedAt: new Date()
    };

    verification.overallStatus = 'pending';
    await verification.save();

    res.json({
      success: true,
      message: 'Aadhaar document uploaded successfully',
      verification
    });
  } catch (error) {
    console.error('Upload Aadhaar Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error, please try again'
    });
  }
};

// @desc    Upload Driving License
// @route   POST /api/verification/driving-license
// @access  Private
const uploadDrivingLicense = async (req, res) => {
  try {
    if (!req.files || !req.files.document) {
      return res.status(400).json({
        success: false,
        message: 'Please upload Driving License'
      });
    }

    const { number, expiryDate } = req.body;
    if (!number) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Driving License number'
      });
    }

    const document = req.files.document;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(document.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF and image files are allowed'
      });
    }

    // Validate file size (max 10MB)
    if (document.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 10MB'
      });
    }

    const documentUrl = saveUploadedFile(document, 'driving_license');

    let verification = await Verification.findOne({ user: req.user._id });
    if (!verification) {
      verification = await Verification.create({ user: req.user._id });
    }

    verification.drivingLicense = {
      number,
      url: documentUrl,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: 'pending',
      uploadedAt: new Date()
    };

    verification.overallStatus = 'pending';
    await verification.save();

    res.json({
      success: true,
      message: 'Driving License uploaded successfully',
      verification
    });
  } catch (error) {
    console.error('Upload Driving License Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error, please try again'
    });
  }
};

// @desc    Upload Vehicle Registration
// @route   POST /api/verification/vehicle-registration
// @access  Private
const uploadVehicleRegistration = async (req, res) => {
  try {
    if (!req.files || !req.files.document) {
      return res.status(400).json({
        success: false,
        message: 'Please upload Vehicle Registration'
      });
    }

    const { number } = req.body;
    if (!number) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Vehicle Registration number'
      });
    }

    const document = req.files.document;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(document.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF and image files are allowed'
      });
    }

    // Validate file size (max 10MB)
    if (document.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 10MB'
      });
    }

    const documentUrl = saveUploadedFile(document, 'vehicle_registration');

    let verification = await Verification.findOne({ user: req.user._id });
    if (!verification) {
      verification = await Verification.create({ user: req.user._id });
    }

    verification.vehicleRegistration = {
      number,
      url: documentUrl,
      status: 'pending',
      uploadedAt: new Date()
    };

    verification.overallStatus = 'pending';
    await verification.save();

    res.json({
      success: true,
      message: 'Vehicle Registration uploaded successfully',
      verification
    });
  } catch (error) {
    console.error('Upload Vehicle Registration Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error, please try again'
    });
  }
};

module.exports = {
  getVerificationStatus,
  uploadProfilePhoto,
  uploadAadhaar,
  uploadDrivingLicense,
  uploadVehicleRegistration
};
