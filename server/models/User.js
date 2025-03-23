const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  workId: { type: String, unique: true, required: true },
  fullname: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  dept: { type: String, required: true },
  role: { type: String, enum: ["admin", "user",], default: "user" },
});

module.exports = mongoose.model("User", UserSchema);
