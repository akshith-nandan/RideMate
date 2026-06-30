const Ride = require('../models/Ride');
const Vehicle = require('../models/Vehicle');
const { matchRoutes } = require('../utils/routeMatcher');
// @desc    Create a new ride
// @route   POST /api/ride/create
// @access  Private/Driver
const createRide = async (req, res) => {
  try {
    const { startLocation, destination, routePoints, departureTime, costPerSeat, availableSeats } = req.body;
    // Check if user has a vehicle
    const vehicle = await Vehicle.findOne({ owner: req.user._id });
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: 'No vehicle registered. Please add a vehicle in your profile first.'
      });
    }
    if (!startLocation || !destination || !routePoints || !departureTime || !costPerSeat || !availableSeats) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    const ride = await Ride.create({
      driver: req.user._id,
      vehicle: vehicle._id,
      startLocation,
      destination,
      routePoints,
      departureTime,
      costPerSeat,
      availableSeats,
      status: 'active'
    });
    res.status(201).json({
      success: true,
      message: 'Ride created successfully',
      ride
    });
  } catch (error) {
    console.error('Create Ride Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
// @desc    Get all active rides or search rides using route matching algorithm
// @route   GET /api/rides
// @access  Private
const getRides = async (req, res) => {
  try {
    const { pickup, destination } = req.query;
    // Get active rides only. Populate driver and vehicle details.
    const rides = await Ride.find({ status: 'active', availableSeats: { $gt: 0 } })
      .populate('driver', 'name phone rating profilePic')
      .populate('vehicle', 'type number model capacity');
    if (!pickup || !destination) {
      // Return all active rides if no search inputs
      return res.json({ success: true, count: rides.length, rides });
    }
    // Apply route matching algorithm
    const matchedRides = [];
    for (let ride of rides) {
      const matchResult = matchRoutes(ride.routePoints, pickup, destination);
      if (matchResult.isMatch) {
        // Convert to plain object to attach match percentage
        const plainRideObj = ride.toObject();
        plainRideObj.matchPercentage = matchResult.percentage;
        plainRideObj.routeCoords = matchResult; // contains coordinates for mapping
        matchedRides.push(plainRideObj);
      }
    }
    // Sort matching rides by percentage descending
    matchedRides.sort((a, b) => b.matchPercentage - a.matchPercentage);
    res.json({
      success: true,
      count: matchedRides.length,
      rides: matchedRides
    });
  } catch (error) {
    console.error('Get Rides Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
// @desc    Get ride details by ID
// @route   GET /api/ride/:id
// @access  Private
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name phone rating profilePic')
      .populate('vehicle', 'type number model capacity');
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
    res.json({ success: true, ride });
  } catch (error) {
    console.error('Get Ride By ID Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
module.exports = {
  createRide,
  getRides,
  getRideById
};
