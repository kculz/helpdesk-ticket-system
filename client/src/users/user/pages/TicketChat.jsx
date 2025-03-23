import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiMic } from "react-icons/fi";
import { useMutation, useQuery } from "@apollo/client";
import { GET_CHAT_MESSAGES } from "../../../apollo/queries";
import { SEND_MESSAGE } from "../../../apollo/mutations";
import Loader from "../components/Loader";

const TicketChat = ({ ticketId }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef(null);

  // Fetch chat messages
  const { data, loading, error } = useQuery(GET_CHAT_MESSAGES, {
    variables: { ticketId },
  });

  // Send message mutation
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    refetchQueries: [{ query: GET_CHAT_MESSAGES, variables: { ticketId } }],
  });

  // Update messages when data is fetched
  useEffect(() => {
    if (data?.getChatMessages) {
      setMessages(data.getChatMessages);
    }
  }, [data]);

  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === "") return;

    try {
      // Send the message to the backend
      await sendMessage({
        variables: {
          ticketId,
          sender: "user", // Replace with the actual sender (e.g., authenticated user)
          message: inputText,
        },
      });

      // Clear the input field
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) return <Loader type="ticketChat" />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="flex flex-col bg-background p-6">
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
                    : "bg-card text-foreground border border-border"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
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
        className="max-w-2xl mx-auto w-full bg-card p-4 rounded-xl border border-border md:mt-20 mt-10"
      >
        <div className="flex items-center">
          {/* Record Audio Button (Placeholder for future functionality) */}
          <button
            type="button"
            className="p-2 text-foreground hover:text-primary transition-all"
            onClick={() => alert("Record audio functionality coming soon!")}
          >
            <FiMic size={20} />
          </button>

          {/* Message Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Send Message Button */}
          <button
            type="submit"
            className="ml-4 p-2 bg-primary text-white rounded-lg hover:bg-secondary transition-all"
          >
            <FiSend size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketChat;