const Otp = require("../models/OTP");
const sendOTP = require("../utils/sendOTP");

// =========================
// Send OTP
// =========================
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete old OTP if exists
    await Otp.deleteMany({ phone });

    // Save new OTP
    await Otp.create({
      phone,
      otp,
      expiresAt,
    });

    // Send SMS
    await sendOTP(phone, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// =========================
// Verify OTP
// =========================
const verifyOtp = async (req, res) => {
  try {

    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({ phone });

    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "OTP not found",
      });
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {

      await Otp.deleteOne({ phone });

      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });

    }

    // Check OTP
    if (otpRecord.otp !== otp) {

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });

    }

    // Delete OTP after successful verification
    await Otp.deleteOne({ phone });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });

  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};