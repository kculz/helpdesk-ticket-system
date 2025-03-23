require("dotenv").config();
const nodemailer = require("nodemailer");
const emailQueue = require("../queues/emailQueue");

// 1. Configure Nodemailer (using a test account or your SMTP details)
const transporter = nodemailer.createTransport({
  service: "gmail", // or your preferred email service
  auth: {
    user: process.env.EMAIL_USERNAME, // e.g. "myemail@gmail.com"
    pass: process.env.EMAIL_PASSWORD, // e.g. "mygmailpassword"
  },
});

// 2. Process jobs from the queue
emailQueue.process(async (job) => {
  const { email, otp } = job.data;

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}\n\nThis OTP will expire in 5 minutes. Do not share it with anyone.`,
  };

  // 3. Send email
  await transporter.sendMail(mailOptions);
  console.log(`OTP sent to ${email}: ${otp}`);
});

console.log("Worker is running and listening for jobs...");
