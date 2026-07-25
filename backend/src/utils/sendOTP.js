const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const sendOTP = async (phone, otp) => {
    await client.messages.create({
        body: `Your RideMate OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
    });
};

module.exports = sendOTP;