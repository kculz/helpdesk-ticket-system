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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === "") return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      sender: "user",
      message: inputText,
      messageType: "text",
      voiceUrl: null,
      createdAt: new Date().toISOString(),
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
    const tempMessage = {
      id: tempId,
      sender: "user",
      message: "Voice message...",
      messageType: "voice",
      voiceUrl: null,
      createdAt: new Date().toISOString(),
      __typename: "ChatMessage"
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

    // Format date using moment
    const formatDate = (dateInput) => {
      // Handle null/undefined
      if (!dateInput) return "Just now";

      let date;

      // Case 1: It's a number (Unix timestamp in milliseconds)
      if (typeof dateInput === 'number') {
        date = new Date(dateInput);
      }
      // Case 2: It's a string that could be a number (e.g., '1747001394128')
      else if (typeof dateInput === 'string' && /^\d+$/.test(dateInput)) {
        date = new Date(parseInt(dateInput, 10));
      }
      // Case 3: It's an ISO string or other date string
      else if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      }
      // Case 4: It's already a Date object
      else if (dateInput instanceof Date) {
        date = dateInput;
      }
      // Case 5: It's a MongoDB object with $date field
      else if (dateInput.$date) {
        date = new Date(dateInput.$date);
      }
      // All other cases
      else {
        return "Just now";
      }

      // Final validation
      if (isNaN(date.getTime())) {
        console.error("Invalid date input:", dateInput);
        return "Just now";
      }

      const now = new Date();
      const diffSeconds = Math.floor((now - date) / 1000);

      if (diffSeconds < 60) return "Just now";
      
      // Format as "3:45 PM"
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    };


    const displayMessages = messages.filter(msg => {
    if (msg.isOptimistic) {
      // Only show if we haven't received the real message yet
      return !messages.some(m => !m.isOptimistic && m.createdAt === msg.createdAt);
    }
    return true;
  });

  // Group consecutive messages from same sender
  const groupedMessages = displayMessages.reduce((groups, message) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup[0].sender === message.sender) {
      lastGroup.push(message);
    } else {
      groups.push([message]);
    }
    return groups;
  }, []);

  if (messagesLoading || ticketLoading) {
    return <Loader />;
  }

  // const groupedMessages = groupMessages(messages);

  return (
    <div className="flex flex-col bg-background p-6 h-full">
      {/* Priority and Call Buttons */}
      {ticket?.priority === "high" && (
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
          {groupedMessages.map((messageGroup, groupIndex) => (
        <div key={`group-${groupIndex}`} className={`flex ${messageGroup[0].sender === "user" ? "justify-end" : "justify-start"} mb-3`}>
              <div className="flex flex-col space-y-1 max-w-[70%]">
                {messageGroup.map((msg, msgIndex) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl ${
                      msg.sender === "user"
                        ? "bg-primary text-white rounded-br-none"
                        : msg.sender === "ai"
                        ? "bg-purple-100 text-foreground border border-purple-200 rounded-bl-none"
                        : "bg-card text-foreground border border-border rounded-bl-none"
                    } ${
                      msgIndex === 0 ? 'rounded-tl-xl' : 'rounded-tl-sm'
                    } ${
                      msgIndex === messageGroup.length - 1 ? 'rounded-bl-xl' : 'rounded-bl-sm'
                    }`}
                  >
                    {msgIndex === 0 && (
                      <p className="text-xs font-semibold mb-1">
                        {msg.sender === "user" ? "You" : 
                         msg.sender === "ai" ? "AI Assistant" : "Support Agent"}
                      </p>
                    )}
                    {msg.messageType === 'voice' ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => playAudio(msg.voiceUrl, msg.message)}
                          className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30"
                        >
                          <FiVolume2 size={16} />
                        </button>
                        <span>{msg.message || "Voice message"}</span>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.message}</p>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {formatDate(msg.createdAt)}
                    </p>
                  </div>
                ))}
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
        {audioBlob ? (
          <div className="flex items-center gap-2 mb-2">
            <audio src={URL.createObjectURL(audioBlob)} controls />
            <button
              type="button"
              onClick={() => setAudioBlob(null)}
              className="text-red-500 hover:text-red-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendVoiceMessage}
              className="ml-auto bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Send Voice
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`p-2 rounded-full ${
                isRecording 
                  ? 'text-white bg-red-500 animate-pulse' 
                  : 'text-foreground hover:text-primary'
              } transition`}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? "Stop recording" : "Start recording"}
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
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              disabled={inputText.trim() === ""}
            >
              <FiSend size={20} />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default TicketChat;