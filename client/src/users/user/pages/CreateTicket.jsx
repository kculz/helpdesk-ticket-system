import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useMutation } from "@apollo/client";
import { CREATE_TICKET } from "../../../apollo/mutations";
import { GET_USER_TICKETS } from "../../../apollo/queries";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const CreateTicket = ({ isOpen, onClose }) => {
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const navigate = useNavigate(); // Initialize useNavigate

  const [createTicket, { loading, error }] = useMutation(CREATE_TICKET, {
    onCompleted: (data) => {
      const newTicketId = data.createTicket.id; // Get the ID of the newly created ticket
      onClose(); // Close the modal
      setDescription(""); // Reset form fields
      setPriority("medium");
      navigate(`/user/ticket/${newTicketId}`); // Redirect to the ticket's page
    },
    refetchQueries: [{ query: GET_USER_TICKETS }], // Refetch tickets after creation
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTicket({ variables: { description, priority } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-soft w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="p-2 text-foreground hover:text-primary focus:outline-none"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
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
              placeholder="Describe your issue..."
              required
            />
          </div>

          {/* Priority Field */}
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

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm mb-4">{error.message}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl hover:bg-secondary transition-all focus:outline-none"
          >
            {loading ? "Submitting..." : "Create Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;