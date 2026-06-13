const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
// @desc    Get user profile & vehicle info
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const vehicle = await Vehicle.findOne({ owner: req.user._id });
    res.json({
      success: true,
      user,
      vehicle: vehicle || null
    });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePic, role } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profilePic) user.profilePic = profilePic;
    if (role) user.role = role;
    const updatedUser = await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        rating: updatedUser.rating,
        profilePic: updatedUser.profilePic
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
// @desc    Add or update vehicle
// @route   POST /api/user/vehicle
// @access  Private
const addOrUpdateVehicle = async (req, res) => {
  try {
    const { type, number, model, capacity } = req.body;
    if (!type || !number || !model || !capacity) {
      return res.status(400).json({ success: false, message: 'Please provide all vehicle details' });
    }
    let vehicle = await Vehicle.findOne({ owner: req.user._id });
    if (vehicle) {
      // Update vehicle
      vehicle.type = type;
      vehicle.number = number;
      vehicle.model = model;
      vehicle.capacity = capacity;
      await vehicle.save();
    } else {
      // Create new vehicle
      vehicle = await Vehicle.create({
        owner: req.user._id,
        type,
        number,
        model,
        capacity
      });
    }
    // Automatically transition user's role to driver
    const user = await User.findById(req.user._id);
    if (user && user.role !== 'driver') {
      user.role = 'driver';
      await user.save();
    }
    res.status(200).json({
      success: true,
      message: 'Vehicle details registered successfully. You are now authorized as a driver.',
      vehicle,
      role: 'driver'
    });
  } catch (error) {
    console.error('Vehicle Registry Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
module.exports = {
  getProfile,
  updateProfile,
  addOrUpdateVehicle
};

