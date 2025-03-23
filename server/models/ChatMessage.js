const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
  sender: { type: String, enum: ["user", "ai","admin"], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure Mongoose automatically includes `id` when returning JSON
ChatMessageSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
