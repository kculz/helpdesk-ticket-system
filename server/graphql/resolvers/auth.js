const jwt = require("jsonwebtoken");
const redis = require("../../redis/client");
const User = require("../../models/User");
const generateOtp = require("../../helpers/otp");
const emailQueue = require("../../queues/emailQueue");



const authResolvers = {
  Mutation: {
    // sendOtp: Generates an OTP, stores it in Redis with a TTL, and (simulated) sends it.
    sendOtp: async (_, { email }) => {
      const otp = generateOtp();
      // Store OTP with a TTL (default to 300 seconds if not set)
      await redis.set(`otp:${email}`, otp, "EX", process.env.OTP_TTL || 3000000);
      console.log(`OTP for ${email}: ${otp}`); // In production, send this OTP via email/SMS.

      await emailQueue.add({ email, otp }); // Simulate sending OTP via email
      return true;
    },

    // verifyOtp: Validates the OTP. If valid, returns the user with a JWT token.
    verifyOtp: async (_, { email, otp }) => {
      const storedOtp = await redis.get(`otp:${email}`);
      if (!storedOtp || storedOtp !== otp) {
        throw new Error("Invalid or expired OTP");
      }
      // Remove the OTP from Redis after verification.
      await redis.del(`otp:${email}`);
      
      // Look up the user (users are created by an admin).
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found. Please contact your administrator.");
      }
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "23h" });
      return { ...user._doc, id: user._id, token };
    },
  },
};

module.exports = authResolvers;
