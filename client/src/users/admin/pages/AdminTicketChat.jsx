import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FiSend, FiPhone, FiCheckCircle, FiVideo } from "react-icons/fi";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { GET_TICKET, GET_CHAT_MESSAGES } from "../../../apollo/queries";
import { SEND_MESSAGE, UPDATE_TICKET_STATUS, INITIATE_CALL } from "../../../apollo/mutations";
import { MESSAGE_SENT_SUBSCRIPTION, CALL_INITIATED_SUBSCRIPTION } from "../../../apollo/subscriptions";
import Loader from "../components/Loader";

const AdminTicketChat = () => {
  const { id: ticketId } = useParams();
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [callStatus, setCallStatus] = useState(null);

  // Queries
  const { data: ticketData, loading: ticketLoading } = useQuery(GET_TICKET, {
    variables: { id: ticketId }
  });

  const { data: messagesData, loading: messagesLoading } = useQuery(GET_CHAT_MESSAGES, {
    variables: { ticketId },
    fetchPolicy: "network-only"
  });

  // Mutations
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [updateTicketStatus] = useMutation(UPDATE_TICKET_STATUS);
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

  // Initialize messages
  useEffect(() => {
    if (messagesData?.getChatMessages) {
      setMessages(messagesData.getChatMessages);
    }
  }, [messagesData]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enhanced date formatting function
  const formatDate = (dateInput) => {
    if (!dateInput) return "Just now";

    let date;

    try {
      // Handle different date input types
      if (typeof dateInput === 'number') {
        // Unix timestamp in milliseconds
        date = new Date(dateInput);
      } else if (typeof dateInput === 'string') {
        // Check if it's a numeric string (timestamp)
        if (/^\d+$/.test(dateInput)) {
          const timestamp = parseInt(dateInput, 10);
          // If it's a 10-digit number, it's likely seconds, so convert to milliseconds
          date = new Date(timestamp.toString().length === 10 ? timestamp * 1000 : timestamp);
        } else {
          // It's an ISO string or other date format
          date = new Date(dateInput);
        }
      } else if (dateInput instanceof Date) {
        // Already a Date object
        date = dateInput;
      } else if (dateInput && typeof dateInput === 'object') {
        // Handle MongoDB date objects or other object formats
        if (dateInput.$date) {
          date = new Date(dateInput.$date);
        } else if (dateInput.seconds) {
          // Firestore timestamp format
          date = new Date(dateInput.seconds * 1000);
        } else {
          // Try to convert object to string and parse
          date = new Date(dateInput.toString());
        }
      } else {
        // Fallback: try to create date from input
        date = new Date(dateInput);
      }

      // Validate the parsed date
      if (!date || isNaN(date.getTime())) {
        console.warn("Invalid date input:", dateInput);
        return "Just now";
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      // Return relative time for very recent messages
      if (diffSeconds < 30) {
        return "Just now";
      } else if (diffSeconds < 60) {
        return `${diffSeconds}s ago`;
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        // Show time for messages within the last 24 hours
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } else if (diffDays < 7) {
        // Show day and time for messages within the last week
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } else {
        // Show full date for older messages
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (error) {
      console.error("Error formatting date:", error, "Input:", dateInput);
      return "Just now";
    }
  };

  // Helper function to get message sender display name
  const getSenderDisplayName = (sender) => {
    switch (sender?.toLowerCase()) {
      case 'admin':
        return 'Admin';
      case 'ai':
        return 'AI Assistant';
      case 'user':
        return 'User';
      case 'technician':
        return 'Technician';
      default:
        return sender || 'Unknown';
    }
  };

  // Helper function to determine if messages should be grouped
  const shouldGroupWithPrevious = (currentMsg, previousMsg) => {
    if (!previousMsg) return false;
    
    // Same sender
    if (currentMsg.sender !== previousMsg.sender) return false;
    
    // Within 2 minutes of each other
    const currentTime = new Date(currentMsg.createdAt).getTime();
    const previousTime = new Date(previousMsg.createdAt).getTime();
    const diffMinutes = (currentTime - previousTime) / (1000 * 60);
    
    return diffMinutes <= 2;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === "") return;

    try {
      const tempId = `temp-${Date.now()}`;
      const now = new Date().toISOString();
      
      await sendMessage({
        variables: {
          ticketId,
          sender: "admin",
          message: inputText,
        },
        optimisticResponse: {
          sendMessage: {
            __typename: "ChatMessage",
            id: tempId,
            sender: "admin",
            message: inputText,
            messageType: "text",
            voiceUrl: null,
            createdAt: now
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

      // Update status to in-progress if still open
      if (ticketData?.getTicket?.status === 'OPEN') {
        await updateTicketStatus({
          variables: {
            id: ticketId,
            status: 'IN_PROGRESS'
          }
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleResolveTicket = async () => {
    try {
      await updateTicketStatus({
        variables: {
          id: ticketId,
          status: 'RESOLVED'
        }
      });
    } catch (error) {
      console.error("Error resolving ticket:", error);
    }
  };

  const handleInitiateCall = async (type) => {
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
    console.log("Call initiated:", callData);
    alert(`${callData.type.toUpperCase()} Call initiated. Call ID: ${callData.callId}`);
  };

  if (ticketLoading || messagesLoading) return <Loader type="spinner" />;

  const ticket = ticketData?.getTicket;

  return (
    <div className="flex flex-col bg-gray-50 h-screen p-6">
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

      {/* Call Status Display */}
      {callStatus && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {callStatus.type.toUpperCase()} Call Active
            </span>
            <span className="text-blue-600 text-sm">
              Call ID: {callStatus.callId}
            </span>
          </div>
        </div>
      )}

      {/* Ticket Details */}
      <div className="mb-4 bg-white p-4 rounded-xl shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-2">Ticket #{ticketId.slice(-6)}</h2>
        <p className="text-gray-600 mb-3">{ticket?.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              ticket?.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
              ticket?.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {ticket?.status?.toLowerCase().replace('_', ' ')}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              ticket?.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
              ticket?.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {ticket?.priority?.toLowerCase()} priority
            </span>
          </div>
          {ticket?.user && (
            <div className="text-sm text-gray-600">
              User: {ticket.user.fullname || ticket.user.name || ticket.user.email || 'Unknown'}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-6 bg-white rounded-xl shadow-sm border border-border">
        <div className="p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const previousMsg = index > 0 ? messages[index - 1] : null;
              const isGrouped = shouldGroupWithPrevious(msg, previousMsg);
              
              return (
                <div key={msg.id} className={`${isGrouped ? 'mt-1' : 'mt-4'}`}>
                  <div
                    className={`flex ${
                      msg.sender === "admin" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-[70%]">
                      {/* Show sender name for non-grouped messages */}
                      {!isGrouped && (
                        <div className={`text-xs text-gray-500 mb-1 ${
                          msg.sender === "admin" ? "text-right" : "text-left"
                        }`}>
                          {getSenderDisplayName(msg.sender)}
                        </div>
                      )}
                      
                      <div
                        className={`p-3 rounded-lg ${
                          msg.sender === "admin"
                            ? "bg-blue-500 text-white rounded-br-sm"
                            : msg.sender === "ai"
                            ? "bg-purple-100 text-gray-800 border border-purple-200 rounded-bl-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                      >
                        {/* Voice message handling */}
                        {msg.messageType === "voice" && msg.voiceUrl ? (
                          <div>
                            <audio controls className="w-full">
                              <source src={msg.voiceUrl} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                            {msg.message && (
                              <p className="text-sm mt-2">{msg.message}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        )}
                        
                        <div className={`text-xs mt-2 ${
                          msg.sender === "admin" ? "text-blue-100" : "text-gray-500"
                        }`}>
                          {formatDate(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white p-4 rounded-xl shadow-sm border border-border"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResolveTicket}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              ticket?.status === 'RESOLVED'
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
            }`}
            disabled={ticket?.status === 'RESOLVED'}
          >
            <FiCheckCircle size={16} />
            <span>{ticket?.status === 'RESOLVED' ? 'Resolved' : 'Resolve'}</span>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              ticket?.status === 'RESOLVED' 
                ? "Ticket is resolved" 
                : "Type your response..."
            }
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={ticket?.status === 'RESOLVED'}
          />

          <button
            type="submit"
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={ticket?.status === 'RESOLVED' || inputText.trim() === ''}
          >
            <FiSend size={20} />
          </button>
        </div>
      </form>

    </div>
  );
};

export default AdminTicketChat;