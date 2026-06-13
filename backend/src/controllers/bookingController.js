const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const { matchRoutes } = require('../utils/routeMatcher');
// @desc    Request a ride booking
// @route   POST /api/booking/request
// @access  Private
const requestBooking = async (req, res) => {
  try {
    const { rideId, pickup, dropoff, seatsRequested } = req.body;
    if (!rideId || !pickup || !dropoff) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
    if (ride.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This ride is no longer active' });
    }
    // Check if the passenger is the driver
    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own ride' });
    }
    // Check if user has already requested a booking
    const existingBooking = await Booking.findOne({ ride: rideId, passenger: req.user._id });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You have already requested this ride' });
    }
    // Check seats availability
    const requestedSeats = seatsRequested || 1;
    if (ride.availableSeats < requestedSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${ride.availableSeats} seats available. You requested ${requestedSeats}.`
      });
    }
    // Calculate match percentage
    const matchResult = matchRoutes(ride.routePoints, pickup, dropoff);
    const booking = await Booking.create({
      ride: rideId,
      passenger: req.user._id,
      pickup,
      dropoff,
      seatsRequested: requestedSeats,
      status: 'pending',
      matchPercentage: matchResult.percentage
    });
    res.status(201).json({
      success: true,
      message: 'Ride requested successfully',
      booking
    });
  } catch (error) {
    console.error('Request Booking Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
// @desc    Accept a ride request
// @route   PUT /api/booking/accept
// @access  Private/Driver
const acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('ride');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }
    // Check if the current user is the driver
    if (booking.ride.driver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to perform this action' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Booking status is already ${booking.status}` });
    }
    const ride = await Ride.findById(booking.ride._id);
    if (ride.availableSeats < booking.seatsRequested) {
      return res.status(400).json({ success: false, message: 'Not enough seats available to accept this booking' });
    }
    // Deduct seats
    ride.availableSeats -= booking.seatsRequested;
    await ride.save();
    booking.status = 'accepted';
    await booking.save();
    res.json({
      success: true,
      message: 'Booking accepted successfully',
      booking
    });
  } catch (error) {
    console.error('Accept Booking Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
// @desc    Reject a ride request
// @route   PUT /api/booking/reject
// @access  Private/Driver
const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('ride');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }
    // Check if the current user is the driver
    if (booking.ride.driver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to perform this action' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Booking status is already ${booking.status}` });
    }
    booking.status = 'rejected';
    await booking.save();
    res.json({
      success: true,
      message: 'Booking rejected successfully',
      booking
    });
  } catch (error) {
    console.error('Reject Booking Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
// @desc    Get passenger booking history/dashboard
// @route   GET /api/booking/passenger
// @access  Private
const getPassengerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate({
        path: 'ride',
        populate: [
          { path: 'driver', select: 'name phone rating profilePic' },
          { path: 'vehicle', select: 'type number model capacity' }
        ]
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('Get Passenger Bookings Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
// @desc    Get driver booking requests & rides history
// @route   GET /api/booking/driver
// @access  Private/Driver
const getDriverBookings = async (req, res) => {
  try {
    // Find all rides created by this driver
    const rides = await Ride.find({ driver: req.user._id });
    const rideIds = rides.map(r => r._id);
    // Get bookings associated with those rides
    const bookings = await Booking.find({ ride: { $in: rideIds } })
      .populate('passenger', 'name phone rating profilePic')
      .populate({
        path: 'ride',
        populate: { path: 'vehicle', select: 'type number model capacity' }
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('Get Driver Bookings Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
module.exports = {
  requestBooking,
  acceptBooking,
  rejectBooking,
  getPassengerBookings,
  getDriverBookings
};

