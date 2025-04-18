const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  ticketId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Ticket", 
    required: true 
  },
  sender: { 
    type: String, 
    enum: ["user", "ai", "admin"], 
    required: true 
  },
  message: { 
    type: String, 
    required: function() {
      return this.messageType === 'text'; // 'message' is required only if messageType is 'text'
    },
    default: '', // If no message is provided (for voice messages), it defaults to an empty string
  },
  messageType: { 
    type: String, 
    enum: ["text", "voice"], 
    default: "text" 
  },
  voiceUrl: { 
    type: String, 
    default: null // URL of the uploaded voice file, if any
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Ensure Mongoose automatically includes `id` when returning JSON
ChatMessageSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
