import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiMic, FiPhone, FiVideo, FiVolume2 } from "react-icons/fi";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { GET_CHAT_MESSAGES, GET_TICKET } from "../../../apollo/queries";
import { SEND_MESSAGE, INITIATE_CALL, CONVERT_TEXT_TO_SPEECH } from "../../../apollo/mutations";
import { MESSAGE_SENT_SUBSCRIPTION, CALL_INITIATED_SUBSCRIPTION } from "../../../apollo/subscriptions";
import Loader from "../components/Loader";

const TicketChat = ({ ticketId }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [ticket, setTicket] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chatEndRef = useRef(null);

  const [initiateCall] = useMutation(INITIATE_CALL)
  const [convertTextToSpeech] = useMutation(CONVERT_TEXT_TO_SPEECH);

  // Fetch initial messages and ticket data
  const { data: messagesData, loading: messagesLoading } = useQuery(GET_CHAT_MESSAGES, {
    variables: { ticketId },
    fetchPolicy: "network-only"
  });

  const { data: ticketData, loading: ticketLoading } = useQuery(GET_TICKET, {
    variables: { id: ticketId },
  });

  // Mutations
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      // This ensures we have the latest message from server
      if (data.sendMessage) {
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === data.sendMessage.id);
          return exists ? prev : [...prev, data.sendMessage];
        });
      }
    }
  });

  // Subscriptions
  useSubscription(MESSAGE_SENT_SUBSCRIPTION, {
    variables: { ticketId },
    onSubscriptionData: ({ subscriptionData }) => {
      const newMessage = subscriptionData.data?.messageSent;
      if (newMessage && newMessage.sender !== "user") { // Only add non-user messages
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          return exists ? prev : [...prev, newMessage];
        });
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

  // Enhanced date formatting function for chat messages
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

      // Return appropriate format based on time difference
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
      } else if (diffDays === 1) {
        // Yesterday with time
        return `Yesterday ${date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}`;
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

  // Helper function to get full date tooltip
  const getFullDateTooltip = (dateInput) => {
    if (!dateInput) return "No timestamp available";

    try {
      let date;
      if (typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else if (typeof dateInput === 'string' && /^\d+$/.test(dateInput)) {
        const timestamp = parseInt(dateInput, 10);
        date = new Date(timestamp.toString().length === 10 ? timestamp * 1000 : timestamp);
      } else {
        date = new Date(dateInput);
      }

      if (isNaN(date.getTime())) return "Invalid timestamp";

      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "Invalid timestamp";
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

  // Helper function to get sender display name
  const getSenderDisplayName = (sender) => {
    switch (sender?.toLowerCase()) {
      case 'user':
        return 'You';
      case 'ai':
        return 'AI Assistant';
      case 'admin':
        return 'Support Agent';
      case 'technician':
        return 'Technician';
      default:
        return sender || 'Unknown';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === "") return;

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const tempMessage = {
      id: tempId,
      sender: "user",
      message: inputText,
      messageType: "text",
      voiceUrl: null,
      createdAt: now,
      __typename: "ChatMessage",
      isOptimistic: true // Mark as optimistic
    };

    // 1. Immediately add to UI
    setMessages(prev => [...prev, tempMessage]);
    setInputText("");

    try {
      // 2. Send to server
      await sendMessage({
        variables: {
          ticketId,
          sender: "user",
          message: inputText,
          messageType: "text"
        },
        // The onCompleted handler will update with the real message
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove if failed
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const handleSendVoiceMessage = async () => {
    if (!audioBlob) return;

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const tempMessage = {
      id: tempId,
      sender: "user",
      message: "Voice message...",
      messageType: "voice",
      voiceUrl: null,
      createdAt: now,
      __typename: "ChatMessage",
      isOptimistic: true
    };

    // Optimistic update
    setMessages(prev => [...prev, tempMessage]);
    setAudioBlob(null);

    try {
      const file = new File([audioBlob], `voice-${Date.now()}.mp3`, {
        type: 'audio/mpeg',
      });

      await sendMessage({
        variables: {
          ticketId,
          sender: "user",
          messageType: "voice",
          voiceFile: file
        },
        optimisticResponse: {
          sendMessage: tempMessage
        },
        update: (cache, { data: { sendMessage: serverMessage } }) => {
          setMessages(prev => 
            prev.map(msg => msg.id === tempId ? serverMessage : msg)
          );
        }
      });
    } catch (error) {
      console.error("Error sending voice message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const playAudio = async (voiceUrl, messageText) => {
    try {
      if (!voiceUrl && messageText) {
        const { data } = await convertTextToSpeech({
          variables: { text: messageText }
        });
        
        if (data?.convertTextToSpeech?.voiceUrl) {
          const audio = new Audio(data.convertTextToSpeech.voiceUrl);
          audio.play();
          return;
        }
      } else if (voiceUrl) {
        const audio = new Audio(voiceUrl);
        audio.play();
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      alert("Could not play audio message");
    }
  };

  const handleInitiateCall = async (type) => {
    if (!ticket || ticket.priority !== "high") {
      alert("Calls can only be initiated for high priority tickets");
      return;
    }

    try {
      const { data } = await initiateCall({
        variables: { 
          ticketId, 
          type
        },
      });
      
      if (data?.initiateCall) {
        alert(`${type.toUpperCase()} Call initiated. Call ID: ${data.initiateCall.callId}`);
      }
    } catch (error) {
      console.error("Error initiating call:", error);
      alert("Failed to initiate call");
    }
  };

  // Filter and process messages
  const displayMessages = messages.filter(msg => {
    if (msg.isOptimistic) {
      // Only show if we haven't received the real message yet
      return !messages.some(m => !m.isOptimistic && m.createdAt === msg.createdAt);
    }
    return true;
  });

  if (messagesLoading || ticketLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col bg-background p-6 h-full">
      {/* Ticket Info Header */}
      <div className="mb-4 bg-card p-4 rounded-xl border border-border">
        <h2 className="text-lg font-semibold mb-2">
          Ticket #{ticketId?.slice(-8)} - {ticket?.description}
        </h2>
        <div className="flex gap-2 items-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            ticket?.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
            ticket?.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {ticket?.status?.replace('-', ' ') || 'Unknown'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            ticket?.priority === 'high' ? 'bg-red-100 text-red-800' :
            ticket?.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {ticket?.priority || 'normal'} priority
          </span>
        </div>
      </div>

      {/* Priority and Call Buttons */}
      {ticket?.priority === "high" && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r flex items-center justify-between">
          <span className="text-red-700 font-semibold">
            High Priority Ticket - Call Support Available
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
      <div className="flex-1 overflow-y-auto mb-6 bg-card rounded-xl p-4 border border-border">
        <div className="max-w-full">
          {displayMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">Start the conversation by sending a message below</p>
            </div>
          ) : (
            displayMessages.map((msg, index) => {
              const previousMsg = index > 0 ? displayMessages[index - 1] : null;
              const isGrouped = shouldGroupWithPrevious(msg, previousMsg);
              
              return (
                <div key={msg.id} className={`${isGrouped ? 'mt-1' : 'mt-4'}`}>
                  <div
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-[80%] md:max-w-[70%]">
                      {/* Show sender name and timestamp for non-grouped messages */}
                      {!isGrouped && (
                        <div className={`flex items-center justify-between mb-1 ${
                          msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                        }`}>
                          <span className="text-xs font-medium text-gray-600">
                            {getSenderDisplayName(msg.sender)}
                          </span>
                          <span 
                            className="text-xs text-gray-500 mx-2 cursor-help" 
                            title={getFullDateTooltip(msg.createdAt)}
                          >
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      <div
                        className={`p-3 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-primary text-white rounded-br-sm"
                            : msg.sender === "ai"
                            ? "bg-purple-50 text-gray-800 border border-purple-200 rounded-bl-sm"
                            : "bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-sm"
                        } ${msg.isOptimistic ? 'opacity-70' : ''}`}
                      >
                        {/* Voice message handling */}
                        {msg.messageType === 'voice' ? (
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => playAudio(msg.voiceUrl, msg.message)}
                              className={`p-2 rounded-full transition-colors ${
                                msg.sender === "user" 
                                  ? "bg-white bg-opacity-20 hover:bg-opacity-30" 
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                              title="Play voice message"
                            >
                              <FiVolume2 size={16} />
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-current opacity-30 rounded-full"></div>
                                <span className="text-xs opacity-70">Voice message</span>
                              </div>
                              {msg.message && msg.message !== "Voice message..." && (
                                <p className="text-sm mt-1">{msg.message}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            {msg.isOptimistic && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                <span className="text-xs opacity-70 ml-1">Sending...</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Show timestamp for grouped messages on hover */}
                        {isGrouped && (
                          <div 
                            className="text-xs opacity-0 hover:opacity-70 transition-opacity mt-1 cursor-help"
                            title={getFullDateTooltip(msg.createdAt)}
                          >
                            {formatDate(msg.createdAt)}
                          </div>
                        )}
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
        className="bg-card p-4 rounded-xl border border-border"
      >
        {audioBlob ? (
          <div className="flex items-center gap-3 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 mb-2">Voice message recorded</p>
              <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAudioBlob(null)}
                className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendVoiceMessage}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
              >
                Send Voice
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`p-3 rounded-full transition-all ${
              isRecording 
                ? 'text-white bg-red-500 animate-pulse shadow-lg' 
                : 'text-foreground hover:text-primary hover:bg-primary/10'
            }`}
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? "Stop recording" : "Start voice recording"}
          >
            <FiMic size={20} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isRecording ? "Recording..." : "Type your message..."}
            className="flex-1 p-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isRecording}
          />

          <button
            type="submit"
            className="p-3 bg-primary text-white rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={inputText.trim() === "" || isRecording}
          >
            <FiSend size={20} />
          </button>
        </div>

        {isRecording && (
          <div className="mt-3 text-center">
            <p className="text-sm text-red-600 font-medium">
              🔴 Recording... Click the microphone again to stop
            </p>
          </div>
        )}
      </form>

    </div>
  );
};

export default TicketChat;