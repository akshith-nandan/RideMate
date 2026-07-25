const verificationCheck = await twilioClient.verify.v2
  .services(process.env.TWILIO_VERIFY_SERVICE_SID)
  .verificationChecks.create({
    to: phone,
    code: otp,
  });

if (verificationCheck.status === "approved") {
  // OTP is correct
}