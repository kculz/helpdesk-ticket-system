const crypto = require("crypto");

const generateWorkId = () => {
  const prefix = "EMP"; // You can change this to suit your system (e.g., "USR", "WK")
  const randomPart = crypto.randomInt(100000, 999999); // Generates a 6-digit random number
  return `${prefix}-${randomPart}`;
};

module.exports = generateWorkId;
