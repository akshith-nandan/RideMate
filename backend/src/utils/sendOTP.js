const sendOTP = async (phone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your RideMate OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    console.log("Message SID:", message.sid);
  } catch (error) {
    console.error("Twilio Error:", error);
    throw error;
  }
};