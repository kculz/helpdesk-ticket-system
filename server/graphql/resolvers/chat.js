const ChatMessage = require("../../models/ChatMessage");
const Ticket = require("../../models/Ticket");
const { OpenAI } = require("openai");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatResolvers = {
  Query: {
    getChatMessages: async (_, { ticketId }) => {
      try {
        const messages = await ChatMessage.find({ ticketId });
        return messages.map((msg) => ({
          id: msg._id.toString(),
          sender: msg.sender,
          message: msg.message,
          createdAt: msg.createdAt,
        }));
      } catch (error) {
        console.error("Error fetching messages:", error);
        throw new Error("Failed to fetch messages");
      }
    },
  },
  Mutation: {
    sendMessage: async (_, { ticketId, sender, message }) => {
      try {
        // Save the user's message
        const chatMessage = new ChatMessage({
          ticketId,
          sender,
          message,
          createdAt: new Date(),
        });

        const savedUserMessage = await chatMessage.save();

        // Convert to object and explicitly add `id`
        const userMessage = {
          id: savedUserMessage._id.toString(),
          sender: savedUserMessage.sender,
          message: savedUserMessage.message,
          createdAt: savedUserMessage.createdAt,
        };

        // Fetch the ticket to check its priority
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
          console.warn("Ticket not found, returning only user message.");
          return userMessage; // Return the user's message
        }

        let aiMessageObject = null;

        // Check ticket priority
        if (ticket.priority === "low" || ticket.priority === "medium") {
          // Generate an AI response for low/medium priority tickets
          const ticketDescription = ticket.description;

          const prompt = `The user has submitted a troubleshooting ticket with the following description: "${ticketDescription}". They have now sent the following message: "${message}". Provide a helpful response to their message.`;

          try {
            const openaiResponse = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: prompt }],
              max_tokens: 150,
            });

            const aiMessage = openaiResponse.choices[0].message.content;

            const aiChatMessage = new ChatMessage({
              ticketId,
              sender: "ai",
              message: aiMessage,
              createdAt: new Date(),
            });

            const savedAIMessage = await aiChatMessage.save();

            // Convert to object and explicitly add `id`
            aiMessageObject = {
              id: savedAIMessage._id.toString(),
              sender: savedAIMessage.sender,
              message: savedAIMessage.message,
              createdAt: savedAIMessage.createdAt,
            };

            console.log("************ User Message *************", userMessage);
            console.log("************ AI Message *************", aiMessageObject);
          } catch (aiError) {
            console.error("Error generating AI response:", aiError);
          }
        } else if (ticket.priority === "high") {
          // Notify the admin for high priority tickets
          console.log("High priority ticket. Admin intervention required.");
          // You can add logic here to notify the admin (e.g., send an email or push notification)
        }

        // Return the user's message (and AI message if applicable)
        return aiMessageObject ? aiMessageObject : userMessage;
      } catch (error) {
        console.error("Error processing sendMessage mutation:", error);
        throw new Error("Failed to send message");
      }
    },
  },
};

module.exports = chatResolvers;