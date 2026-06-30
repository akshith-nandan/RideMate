const express = require('express');
const router = express.Router();
const { createRide, getRides, getRideById } = require('../controllers/rideController');
const { protect } = require('../middleware/auth');
router.post('/create', protect, createRide);
router.get('/', protect, getRides);
router.get('/:id', protect, getRideById);
module.exports = router;