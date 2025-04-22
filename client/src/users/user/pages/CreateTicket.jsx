import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useMutation } from "@apollo/client";
import { CREATE_TICKET } from "../../../apollo/mutations";
import { GET_USER_TICKETS } from "../../../apollo/queries";
import { useNavigate } from "react-router-dom";

const CreateTicket = ({ isOpen, onClose }) => {
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  const [createTicket, { loading, error }] = useMutation(CREATE_TICKET, {
    onCompleted: (data) => {
      const newTicketId = data.createTicket.id;
      onClose();
      setDescription("");
      setPriority("medium");
      setCategory("general");
      navigate(`/user/ticket/${newTicketId}`);
    },
    refetchQueries: [{ query: GET_USER_TICKETS }],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTicket({ 
      variables: { 
        description, 
        priority: category === "technical" ? priority : "medium",
        category,
        requiresTechnician: category === "technical"
      } 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-soft w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="p-2 text-foreground hover:text-primary focus:outline-none"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Category Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (e.target.value !== "technical") {
                  setPriority("medium");
                }
              }}
              className="w-full border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              required
            >
              <option value="" disabled selected={!category}>
                Select Category
              </option>
              <option value="technical">Technical (Requires Technician)</option>
              <option value="general">General (AI Support)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              {category === "technical" 
                ? "This ticket will be handled by a human technician" 
                : "This ticket will be handled by our support system"}
            </p>
          </div>

          {/* Description Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              rows="4"
              placeholder="Describe your issue in detail..."
              required
              minLength={20}
            />
          </div>

          {/* Priority Field - Only shown for technical tickets */}
          {category === "technical" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm mb-4">{error.message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark transition-all focus:outline-none disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Create Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;