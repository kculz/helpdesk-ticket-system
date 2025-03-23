const jwt = require("jsonwebtoken");

const authMiddleware = (req) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader); // Log the header

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  console.log("Token:", token); // Log the token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Log the decoded token
    return decoded;
  } catch (error) {
    console.error("Token Verification Error:", error.message); // Log the error
    throw new Error("Unauthorized: Invalid or expired token");
  }
};

module.exports = authMiddleware;