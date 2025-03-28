require("dotenv").config();
const nodemailer = require("nodemailer");
const emailQueue = require("../queues/emailQueue");

// Configure Nodemailer with curlben.com SMTP details
const transporter = nodemailer.createTransport({
  host: "mail.curlben.com", // Your SMTP server
  port: 465, // Secure SMTP port
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME || "no-reply@curlben.com",
    pass: process.env.EMAIL_PASSWORD, // Use the email account's password
  },
  tls: {
    // Ensure secure connection
    rejectUnauthorized: false, // Set to true in production with valid SSL
  },
});

// Process jobs from the queue
emailQueue.process(async (job) => {
  const { email, otp } = job.data;

  const mailOptions = {
    from: `"Helpdesk Info" <no-reply@curlben.com>`, // Sender name + email
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}\n\nThis OTP will expire in 5 minutes. Do not share it with anyone.`,
    // Optional HTML version:
    html: `
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 5 minutes. Do not share it with anyone.</p>
    `,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Failed to send OTP:", error);
    throw error; // Re-throw to retry the job if needed
  }
});

console.log("Email worker is running...");