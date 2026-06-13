const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, addOrUpdateVehicle } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/vehicle', protect, addOrUpdateVehicle);
module.exports = router;