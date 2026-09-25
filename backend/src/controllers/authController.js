const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const OTP = require('../models/OTP');
const twilioClient = require('../config/twilio');

const normalizeIndianPhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');

  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits}`;

  return null;
};

const isDevelopmentOtpBypassEnabled = () =>
  process.env.NODE_ENV !== 'production' && process.env.OTP_DEV_BYPASS !== 'false';

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
    let { name, email, phone, password, role } = req.body;

    if (phone) {
      phone = normalizeIndianPhone(phone);
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid 10-digit Indian mobile number",
        });
      }
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if another user already uses this email
    const emailUser = await User.findOne({ email });

    if (emailUser && emailUser.phone !== phone) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check if phone user already exists
    let user = await User.findOne({ phone });

    if (user) {
      // Link email account with existing phone account
      user.name = name;
      user.email = email;
      user.password = password;
      user.role = role || user.role;

      if (!user.authMethods.includes("email")) {
        user.authMethods.push("email");
      }

      await user.save();
    } else {
      // Create completely new user
      user = await User.create({
        name,
        email,
        phone,
        password,
        role: role || "passenger",
        authMethods: ["email"],
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Signup Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
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

const requestPasswordReset = async (req, res) => {
  try {
    const { phone } = req.body;
    const formattedPhone = normalizeIndianPhone(phone);

    if (!formattedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid 10-digit Indian mobile number'
      });
    }

    const user = await User.findOne({phone: formattedPhone});
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this phone number does not exist'
      });
    }

    try {
      await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: formattedPhone, channel: 'sms' });
    } catch (twilioError) {
      if (!isDevelopmentOtpBypassEnabled()) throw twilioError;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.deleteMany({ phone: formattedPhone });
      await OTP.create({ phone: formattedPhone, otp });
      console.warn(`Password-reset OTP for ${formattedPhone}: ${otp}`);
    }

    res.json({ success: true, message: 'A verification code has been sent to your phone' });
  } catch (error) {
    console.error('Forget Password Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error, please try again'
    });
  }
};

// @desc    Verify a password-reset OTP and set a new password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    let { phone, otp, password } = req.body;
    phone = normalizeIndianPhone(phone);

    if (!phone || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Phone number, verification code and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this phone number does not exist' });
    }

    let approved = false;
    try {
      const verification = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: phone, code: otp });
      approved = verification.status === 'approved';
    } catch (twilioError) {
      if (!isDevelopmentOtpBypassEnabled()) throw twilioError;
    }

    if (!approved && isDevelopmentOtpBypassEnabled()) {
      const otpRecord = await OTP.findOne({ phone, otp, verified: false, expiresAt: { $gt: new Date() } });
      if (otpRecord) {
        otpRecord.verified = true;
        await otpRecord.save();
        approved = true;
      }
    }

    if (!approved) {
      return res.status(401).json({ success: false, message: 'Invalid or expired verification code' });
    }

    user.password = password;
    if (!user.authMethods.includes('email')) user.authMethods.push('email');
    await user.save();
    await RefreshToken.updateMany({ user: user._id, isRevoked: false }, { isRevoked: true });

    res.json({ success: true, message: 'Password reset successfully. Please sign in.' });
  } catch (error) {
    console.error('Reset Password Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
// @desc    Send OTP to phone
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const formattedPhone = normalizeIndianPhone(phone);

    if (!formattedPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Enter a valid 10-digit Indian mobile number'
      });
    }

    try {
      await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: formattedPhone, channel: 'sms' });
    } catch (twilioError) {
      if (!isDevelopmentOtpBypassEnabled()) throw twilioError;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.deleteMany({ phone: formattedPhone });
      await OTP.create({ phone: formattedPhone, otp });

      console.warn(`\n[RideMate development OTP]\nPhone: ${formattedPhone}\nOTP: ${otp}\nNo SMS was sent.\n`);
      return res.json({
        success: true,
        message: 'Development OTP generated. Check the backend terminal.',
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your phone'
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
    let { phone, otp, name, role } = req.body;
    phone = normalizeIndianPhone(phone);

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "A valid phone number and OTP are required",
      });
    }

    let approved = false;

    try {
      const verification = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: phone, code: otp });
      approved = verification.status === 'approved';
    } catch (twilioError) {
      if (!isDevelopmentOtpBypassEnabled()) throw twilioError;
    }

    if (!approved && isDevelopmentOtpBypassEnabled()) {
      const otpRecord = await OTP.findOne({
        phone,
        otp,
        verified: false,
        expiresAt: { $gt: new Date() },
      });

      if (otpRecord) {
        otpRecord.verified = true;
        await otpRecord.save();
        approved = true;
      }
    }

    if (!approved) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        name,
        phone,
        role: role || "passenger",
        phoneVerified: true,
        authMethods: ["phone"],
      });
    } else {
      user.phoneVerified = true;

      if (!user.authMethods.includes("phone")) {
        user.authMethods.push("phone");
      }

      await user.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Twilio verify OTP error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
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
  requestPasswordReset,
  resetPassword,
  refreshAccessToken,
  sendOTP,
  verifyOTP,
  googleAuth,
  logout
};
