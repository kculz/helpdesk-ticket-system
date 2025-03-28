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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === "") return;

    try {
      await sendMessage({
        variables: {
          ticketId,
          sender: "admin",
          message: inputText,
        },
        optimisticResponse: {
          sendMessage: {
            __typename: "ChatMessage",
            id: `temp-${Date.now()}`,
            sender: "admin",
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

      {/* Ticket Details */}
      <div className="mb-4 bg-white p-4 rounded-xl shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-2">Ticket #{ticketId.slice(-6)}</h2>
        <p className="text-gray-600 mb-3">{ticket?.description}</p>
        <div className="flex justify-between">
          <span className={`px-2 py-1 rounded-full text-xs ${
            ticket?.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
            ticket?.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {ticket?.status?.toLowerCase().replace('_', '-')}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            ticket?.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
            ticket?.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {ticket?.priority?.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-6">
        <div className="max-w-2xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "admin" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-xl ${
                  msg.sender === "admin"
                    ? "bg-blue-500 text-white"
                    : msg.sender === "ai"
                    ? "bg-purple-100 text-gray-800 border border-purple-200"
                    : "bg-gray-200 text-gray-800"
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
        className="max-w-2xl mx-auto w-full bg-white p-4 rounded-xl shadow-sm border border-border"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResolveTicket}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
              ticket?.status === 'RESOLVED'
                ? 'bg-green-100 text-green-800'
                : 'bg-green-500 text-white hover:bg-green-600'
            } transition`}
            disabled={ticket?.status === 'RESOLVED'}
          >
            <FiCheckCircle size={16} />
            <span>{ticket?.status === 'RESOLVED' ? 'Resolved' : 'Resolve'}</span>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={ticket?.status === 'RESOLVED'}
          />

          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
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