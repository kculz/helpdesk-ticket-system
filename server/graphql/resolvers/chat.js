const ChatMessage = require("../../models/ChatMessage");
const Ticket = require("../../models/Ticket");
const { OpenAI } = require("openai");
const WebSocket = require('ws');
const { createServer } = require('http');
const { PubSub } = require('graphql-subscriptions');
const { uploadFileToStorage } = require("../../helpers/storage");
const path = require('path');
const fs = require('fs');

const pubsub = new PubSub();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// WebSocket Server Setup
const server = createServer();
const wss = new WebSocket.Server({ server });
const clients = new Map();

wss.on('connection', (ws, req) => {
  const ticketId = req.url.split('=')[1];
  console.log(`New WebSocket connection for ticket ${ticketId}`);
  
  if (!clients.has(ticketId)) {
    clients.set(ticketId, new Set());
  }
  clients.get(ticketId).add(ws);

  ws.on('message', (message) => {
    console.log(`Received message for ticket ${ticketId}: ${message}`);
  });

  ws.on('close', () => {
    clients.get(ticketId)?.delete(ws);
    if (clients.get(ticketId)?.size === 0) {
      clients.delete(ticketId);
    }
  });
});

const WS_PORT = process.env.WS_PORT || 8081;
server.listen(WS_PORT, () => {
  console.log(`WebSocket server running on port ${WS_PORT}`);
});

const broadcastToTicket = (ticketId, message) => {
  if (clients.has(ticketId)) {
    const messageString = JSON.stringify({
      ...message,
      timestamp: Date.now()
    });
    for (const client of clients.get(ticketId)) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    }
  }
};

const initiateCall = async (ticketId, userId, type = 'audio') => {
  const callDetails = {
    type,
    ticketId,
    callId: `call_${Date.now()}`,
    participants: [userId, 'admin'],
    timestamp: new Date().toISOString()
  };

  broadcastToTicket(ticketId, {
    type: 'call_initiated',
    ...callDetails
  });

  pubsub.publish(`CALL_INITIATED_${ticketId}`, { 
    callInitiated: {
      ...callDetails,
      __typename: "CallDetails"
    } 
  });

  return callDetails;
};

const textToSpeech = async (text) => {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const voiceUrl = await uploadFileToStorage(buffer, 'audio/mpeg', `${Date.now()}.mp3`);
    return voiceUrl;
  } catch (error) {
    console.error("Error in text-to-speech conversion:", error);
    throw error;
  }
};

// Helper function to check if AI should respond
const shouldAIRespond = (ticket) => {
  // Don't respond with AI if:
  // 1. Ticket is technical AND has an assigned technician
  if (ticket.category === 'technical' && ticket.assignedTo) {
    console.log(`AI response disabled: Technical ticket ${ticket._id} is assigned to technician ${ticket.assignedTo}`);
    return false;
  }
  
  // For all other cases, use existing priority-based logic
  return ticket.priority === "low" || ticket.priority === "medium";
};

const chatResolvers = {
  Query: {
    getChatMessages: async (_, { ticketId }) => {
      try {
        const messages = await ChatMessage.find({ ticketId }).sort({ createdAt: 1 });
        return messages.map((msg) => ({
          id: msg._id.toString(),
          sender: msg.sender,
          message: msg.message,
          messageType: msg.messageType || 'text',
          voiceUrl: msg.voiceUrl,
          createdAt: msg.createdAt,
          __typename: "ChatMessage"
        }));
      } catch (error) {
        console.error("Error fetching messages:", error);
        throw new Error("Failed to fetch messages");
      }
    },
  },
  Mutation: {
    sendMessage: async (_, { ticketId, sender, message, messageType = 'text', voiceFile }) => {
      try {
        let voiceUrl = null;
        
        if (messageType === "voice" && voiceFile) {
          const file = await voiceFile.promise || (await voiceFile);
          const { createReadStream, filename, mimetype } = file;
          const uploadDir = path.join(__dirname, '../../uploads');
          
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          const uploadPath = path.join(uploadDir, filename);
          const stream = createReadStream();
          const out = fs.createWriteStream(uploadPath);
        
          await new Promise((resolve, reject) => {
            stream.pipe(out);
            out.on("finish", resolve);
            out.on("error", reject);
          });
        
          voiceUrl = `/uploads/${filename}`;
          message = '';
        }
        
        const chatMessage = new ChatMessage({
          ticketId,
          sender,
          message,
          messageType,
          voiceUrl,
          createdAt: new Date(),
        });

        const savedMessage = await chatMessage.save();

        const messageObject = {
          id: savedMessage._id.toString(),
          sender: savedMessage.sender,
          message: savedMessage.message,
          messageType: savedMessage.messageType,
          voiceUrl: savedMessage.voiceUrl,
          createdAt: savedMessage.createdAt,
          __typename: "ChatMessage"
        };

        broadcastToTicket(ticketId, {
          type: 'new_message',
          message: messageObject
        });

        pubsub.publish(`MESSAGE_SENT_${ticketId}`, { 
          messageSent: messageObject 
        });

        // Fetch ticket with populated assignedTo field if it references another collection
        const ticket = await Ticket.findById(ticketId).populate('assignedTo');
        if (!ticket) return messageObject;

        let aiMessageObject = null;

        // Check if AI should respond based on ticket category and assignment
        if (shouldAIRespond(ticket)) {
          const prompt = `The user has submitted a troubleshooting ticket with the following description: "${ticket.description}". They have now sent the following message: "${message}". Provide a helpful response to their message.`;

          try {
            const openaiResponse = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: prompt }],
              max_tokens: 150,
            });

            const aiMessageText = openaiResponse.choices[0].message.content;
            let aiVoiceUrl = null;

            if (messageType === 'voice') {
              try {
                aiVoiceUrl = await textToSpeech(aiMessageText);
              } catch (ttsError) {
                console.error("Error generating voice response:", ttsError);
              }
            }

            const aiChatMessage = new ChatMessage({
              ticketId,
              sender: "ai",
              message: aiMessageText,
              messageType: messageType === 'voice' ? 'voice' : 'text',
              voiceUrl: aiVoiceUrl,
              createdAt: new Date(),
            });

            const savedAIMessage = await aiChatMessage.save();

            aiMessageObject = {
              id: savedAIMessage._id.toString(),
              sender: savedAIMessage.sender,
              message: savedAIMessage.message,
              messageType: savedAIMessage.messageType,
              voiceUrl: savedAIMessage.voiceUrl,
              createdAt: savedAIMessage.createdAt,
              __typename: "ChatMessage"
            };

            broadcastToTicket(ticketId, {
              type: 'new_message',
              message: aiMessageObject
            });

            pubsub.publish(`MESSAGE_SENT_${ticketId}`, { 
              messageSent: aiMessageObject 
            });
          } catch (aiError) {
            console.error("Error generating AI response:", aiError);
          }
        } else if (ticket.priority === "high") {
          // Only initiate call for high priority tickets that aren't technical with assigned technicians
          if (!(ticket.category === 'technical' && ticket.assignedTo)) {
            try {
              await initiateCall(ticketId, ticket.userId);
            } catch (callError) {
              console.error("Error initiating call:", callError);
            }
          }
        }

        return aiMessageObject || messageObject;
      } catch (error) {
        console.error("Error processing sendMessage mutation:", error);
        throw new Error("Failed to send message");
      }
    },
    
    convertTextToSpeech: async (_, { text }) => {
      try {
        const voiceUrl = await textToSpeech(text);
        return { success: true, voiceUrl };
      } catch (error) {
        console.error("Error converting text to speech:", error);
        return { success: false, error: error.message };
      }
    },
  },
  Subscription: {
    messageSent: {
      subscribe: (_, { ticketId }) => pubsub.asyncIterator(`MESSAGE_SENT_${ticketId}`),
    },
    callInitiated: {
      subscribe: (_, { ticketId }) => pubsub.asyncIterator(`CALL_INITIATED_${ticketId}`),
    },
  },
};

module.exports = chatResolvers;