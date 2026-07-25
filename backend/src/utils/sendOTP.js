const twilioClient = require("../config/twilio");

const sendOTP = async (phone) => {
  try {
    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phone,
        channel: "sms",
      });

    return verification.status;
  } catch (error) {
    console.error("Twilio OTP Error:", error);
    throw error;
  }
};

module.exports = sendOTP;