import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiMic, FiPhone, FiVideo } from "react-icons/fi";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { GET_CHAT_MESSAGES, GET_TICKET } from "../../../apollo/queries";
import { SEND_MESSAGE, INITIATE_CALL } from "../../../apollo/mutations";
import { MESSAGE_SENT_SUBSCRIPTION, CALL_INITIATED_SUBSCRIPTION } from "../../../apollo/subscriptions";
import Loader from "../components/Loader";

const TicketChat = ({ ticketId }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [ticket, setTicket] = useState(null);
  const [callStatus, setCallStatus] = useState(null);
  const chatEndRef = useRef(null);

  // Fetch initial messages and ticket data
  const { data: messagesData } = useQuery(GET_CHAT_MESSAGES, {
    variables: { ticketId },
    fetchPolicy: "network-only"
  });

  const { data: ticketData } = useQuery(GET_TICKET, {
    variables: { id: ticketId },
  });

  // Mutations
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [initiateCall] = useMutation(INITIATE_CALL);

  // Subscriptions
  useSubscription(MESSAGE_SENT_SUBSCRIPTION, {
    variables: { ticketId },
    onSubscriptionData: ({ subscriptionData }) => {
      const newMessage = subscriptionData.data?.messageSent;
      if (newMessage) {
        setMessages(prev => {
          // Prevent duplicate messages
          const exists = prev.some(msg => msg.id === newMessage.id);
          return exists ? prev : [...prev, newMessage];
        });
      }
    }
  });

  useSubscription(CALL_INITIATED_SUBSCRIPTION, {
    variables: { ticketId },
    onSubscriptionData: ({ subscriptionData }) => {
      const callData = subscriptionData.data?.callInitiated;
      if (callData) {
        setCallStatus(callData);
        // Trigger call connection logic
        handleCallConnection(callData);
      }
    }
  });

  // Initialize messages and ticket data
  useEffect(() => {
    if (messagesData?.getChatMessages) {
      setMessages(messagesData.getChatMessages);
    }
    if (ticketData?.getTicket) {
      setTicket(ticketData.getTicket);
    }
  }, [messagesData, ticketData]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === "") return;

    try {
      await sendMessage({
        variables: {
          ticketId,
          sender: "user",
          message: inputText,
        },
        optimisticResponse: {
          sendMessage: {
            __typename: "ChatMessage",
            id: `temp-${Date.now()}`,
            sender: "user",
            message: inputText,
            createdAt: new Date().toISOString()
          }
        },
        update: (cache, { data: { sendMessage } }) => {
          // Update local cache to reflect new message
          const existingMessages = cache.readQuery({
            query: GET_CHAT_MESSAGES,
            variables: { ticketId }
          });

          if (existingMessages) {
            cache.writeQuery({
              query: GET_CHAT_MESSAGES,
              variables: { ticketId },
              data: {
                getChatMessages: [
                  ...existingMessages.getChatMessages,
                  sendMessage
                ]
              }
            });
          }
        }
      });
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleInitiateCall = async (type) => {
    if (!ticket || ticket.priority !== "HIGH") {
      alert("Calls can only be initiated for high priority tickets");
      return;
    }

    try {
      const { data } = await initiateCall({
        variables: { 
          ticketId, 
          type // 'audio' or 'video'
        },
      });
      
      if (data?.initiateCall) {
        setCallStatus(data.initiateCall);
        handleCallConnection(data.initiateCall);
      }
    } catch (error) {
      console.error("Error initiating call:", error);
    }
  };

  const handleCallConnection = (callData) => {
    // Placeholder for WebRTC connection logic
    // In a real application, you would:
    // 1. Set up WebRTC peer connection
    // 2. Establish connection using callData.callId
    // 3. Handle signaling and media streams
    console.log("Call initiated:", callData);
    alert(`${callData.type.toUpperCase()} Call initiated. Call ID: ${callData.callId}`);
  };

  return (
    <div className="flex flex-col bg-background p-6 h-full">
      {/* Priority and Call Buttons */}
      {ticket?.priority === "HIGH" && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r flex items-center justify-between">
          <span className="text-red-700 font-semibold">
            High Priority Ticket
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleInitiateCall('audio')}
              className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              <FiPhone size={16} />
              Audio Call
            </button>
            <button
              onClick={() => handleInitiateCall('video')}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              <FiVideo size={16} />
              Video Call
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-6">
        <div className="max-w-2xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-xl ${
                  msg.sender === "user"
                    ? "bg-primary text-white"
                    : msg.sender === "ai"
                    ? "bg-purple-100 text-foreground border border-purple-200"
                    : "bg-card text-foreground border border-border"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="max-w-2xl mx-auto w-full bg-card p-4 rounded-xl border border-border"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-foreground hover:text-primary transition"
            onClick={() => alert("Audio recording coming soon")}
          >
            <FiMic size={20} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            disabled={inputText.trim() === ""}
          >
            <FiSend size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketChat;