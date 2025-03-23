const Bull = require("bull");

// Create a new Bull queue for sending emails
const emailQueue = new Bull("emailQueue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

module.exports = emailQueue;