require("dotenv").config();
const nodemailer = require("nodemailer");
const Bull = require("bull");

// Create the email queue
const emailQueue = new Bull("emailQueue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "mail.curlben.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME || "no-reply@curlben.com",
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Process email jobs
emailQueue.process(async (job) => {
  const { email, subject, template, context } = job.data;

  // Define email templates
  const templates = {
    'otp': {
      subject: "Your OTP Code",
      text: `Your OTP is: ${context.otp}\n\nThis OTP will expire in 5 minutes.`,
      html: `<p>Your OTP is: <strong>${context.otp}</strong></p>`
    },
    'technician-assignment': {
      subject: "New Technical Ticket Assigned",
      text: `
        Hello ${context.technicianName},
        
        You have been assigned a new technical ticket (#${context.ticketId}).
        
        Priority: ${context.priority}
        Requester: ${context.requesterName} (${context.requesterEmail})
        
        Description:
        ${context.description}
        
        Please address this ticket promptly.
      `,
      html: `
        <h2>New Technical Ticket Assigned</h2>
        <p>Hello ${context.technicianName},</p>
        <p>You have been assigned a new technical ticket (<strong>#${context.ticketId}</strong>).</p>
        
        <h3>Details:</h3>
        <ul>
          <li><strong>Priority:</strong> ${context.priority}</li>
          <li><strong>Requester:</strong> ${context.requesterName} (${context.requesterEmail})</li>
        </ul>
        
        <h3>Description:</h3>
        <p>${context.description}</p>
        
        <p>Please address this ticket promptly.</p>
      `
    }
  };

  const selectedTemplate = templates[template] || templates['otp'];

  const mailOptions = {
    from: `"Helpdesk System" <no-reply@curlben.com>`,
    to: email,
    subject: subject || selectedTemplate.subject,
    text: selectedTemplate.text,
    html: selectedTemplate.html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
});

console.log("Email worker is running...");

module.exports = emailQueue;