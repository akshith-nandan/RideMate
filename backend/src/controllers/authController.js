const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const OTP = require('../models/OTP');

// Generate Access Token (15 minutes)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
};

// Generate Refresh Token (30 days)
const generateRefreshToken = async (id) => {
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
  
  // Save refresh token to database
  await RefreshToken.create({
    user: id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  
  return refreshToken;
};

// Format user response
const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  rating: user.rating,
  profilePic: user.profilePic,
  googleId: user.googleId,
  phoneVerified: user.phoneVerified,
  authMethods: user.authMethods
});

// @desc    Register with email
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone: phone || '',
      password,
      role: role || 'passenger',
      authMethods: ['email']
    });

    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = await generateRefreshToken(user._id);

      res.status(201).json({
        success: true,
        accessToken,
        refreshToken,
        user: formatUserResponse(user)
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid user data' 
      });
    }
  } catch (error) {
    console.error('Signup Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again' 
    });
  }
};

// @desc    Login with email & password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter both email and password' 
      });
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again' 
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token is required' 
      });
    }

    // Find and verify refresh token
    const savedToken = await RefreshToken.findOne({ 
      token: refreshToken,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });

    if (!savedToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired refresh token' 
      });
    }

    // Verify JWT
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      const newAccessToken = generateAccessToken(user._id);

      res.json({
        success: true,
        accessToken: newAccessToken,
        user: formatUserResponse(user)
      });
    } catch (error) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }
  } catch (error) {
    console.error('Refresh Token Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again' 
    });
  }
};

// @desc    Send OTP to phone
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this phone
    await OTP.deleteMany({ phone });

    // Save new OTP to database
    await OTP.create({
      phone,
      otp,
      attempts: 0
    });

    // Send OTP via SMS (using mock/console for now)
    // In production, replace this with Twilio or another SMS provider
    try {
      await sendSMSOTP(phone, otp);
      console.log(`✓ OTP sent to ${phone}: ${otp}`);
    } catch (smsError) {
      console.error(`✗ Failed to send SMS to ${phone}:`, smsError.message);
      // Still return success - OTP is saved in DB
      // In production, you might want to fail here
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your phone',
      // Remove this in production - only for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Send OTP Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again' 
    });
  }
};

// Helper function to send SMS OTP
const sendSMSOTP = async (phone, otp) => {
  // MOCK: Console logging (replace with real SMS service)
  const message = `Your RideMate OTP is: ${otp}. Valid for 10 minutes.`;
  
  // Log to console (visible in server logs)
  console.log(`
╔════════════════════════════════════════╗
║          📱 SMS OTP SENT              ║
╠════════════════════════════════════════╣
║ To:      +91${phone.slice(-10)}
║ Message: ${message}
╚════════════════════════════════════════╝
  `);

  // TODO: Integrate real SMS provider here
  // Example with Twilio (uncomment and configure):
  /*
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${phone}`
  });
  */

  return Promise.resolve();
};

// @desc    Verify OTP & login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name, role } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and OTP are required' 
      });
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      phone,
      otp,
      expiresAt: { $gt: new Date() },
      verified: false
    });

    if (!otpRecord) {
      // Increment attempts
      await OTP.updateOne(
        { phone, otp },
        { $inc: { attempts: 1 } }
      );

      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // Check max attempts (5)
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({ 
        success: false, 
        message: 'Too many attempts. Please request a new OTP' 
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      if (!name) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name is required for new users' 
        });
      }

      user = await User.create({
        name,
        phone,
        role: role || 'passenger',
        phoneVerified: true,
        authMethods: ['phone']
      });
    } else {
      user.phoneVerified = true;
      if (!user.authMethods.includes('phone')) {
        user.authMethods.push('phone');
      }
      await user.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Verify OTP Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again' 
    });
  }
};

// @desc    Google OAuth callback
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google token is required' 
      });
    }

    // Verify Google token
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    );

    const { id, email, name, picture } = response.data;

    // Find or create user
    let user = await User.findOne({ googleId: id });

    if (!user) {
      // Check if email exists
      user = await User.findOne({ email });

      if (!user) {
        // Create new user
        user = await User.create({
          name,
          email,
          googleId: id,
          googleEmail: email,
          profilePic: picture,
          authMethods: ['google']
        });
      } else {
        // Link Google account to existing user
        user.googleId = id;
        user.googleEmail = email;
        if (!user.authMethods.includes('google')) {
          user.authMethods.push('google');
        }
        await user.save();
      }
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Google authentication failed' 
    });
  }
};

// @desc    Logout - revoke refresh token
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshToken.updateOne(
        { token: refreshToken },
        { isRevoked: true }
      );
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again' 
    });
  }
};

module.exports = {
  signup,
  login,
  refreshAccessToken,
  sendOTP,
  verifyOTP,
  googleAuth,
  logout
};
