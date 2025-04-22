const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  status: { type: String, default: "open", enum: ["open", "in_progress", "resolved"] },
  priority: { type: String, default: "medium", enum: ["low", "medium", "high"] },
  category: { type: String, default: "technical", enum: ["technical", "general"] },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to technician
  requiresTechnician: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ticket", ticketSchema);