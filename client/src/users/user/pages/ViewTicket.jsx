import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { FaStar, FaChevronDown } from "react-icons/fa";
import TicketChat from "./TicketChat"; // Import the TicketChat component
import { GET_TICKET } from "../../../apollo/queries"; // Import the GET_TICKET query
import { UPDATE_TICKET_STATUS } from "../../../apollo/mutations"; // Import the mutation
import Loader from "../components/Loader";

const ViewTicket = () => {
  const { id } = useParams(); // Get the ticket ID from the URL
  const [rating, setRating] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to manage dropdown visibility

  // Fetch ticket details
  const { loading, error, data } = useQuery(GET_TICKET, {
    variables: { id },
  });

  // Mutation to update ticket status
  const [updateTicketStatus] = useMutation(UPDATE_TICKET_STATUS);

  // Handle rating the service
  const handleRateService = (newRating) => {
    setRating(newRating);
    alert(`Thank you for rating our service with ${newRating} stars!`);
  };

  // Handle status change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    try {
      // Update the ticket status
      await updateTicketStatus({
        variables: {
          id,
          status: newStatus,
        },
      });

      // Close the dropdown after updating the status
      setIsDropdownOpen(false);

      // Refetch the ticket details to update the UI
      // You can use Apollo Client's refetch function or rely on cache updates
      alert("Ticket status updated successfully!");
    } catch (error) {
      console.error("Error updating ticket status:", error);
      alert("Failed to update ticket status.");
    }
  };

  if (loading) return <Loader type="viewTicket" />;
  if (error) return <p>Error: {error.message}</p>;

  const ticket = data?.getTicket;

  return (
    <div className="bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">View Ticket</h1>

        {/* Ticket Details */}
        <div className="bg-card rounded-xl shadow-soft border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Ticket Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-sm text-foreground">
              <span className="font-medium">Ticket ID:</span> #{ticket?.id}
            </div>
            <div className="text-sm text-foreground">
              <span className="font-medium">Status:</span>{" "}
              <div className="inline-flex items-center">
                {/* Status Text */}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket?.status === "open"
                      ? "bg-red-100 text-red-600"
                      : ticket?.status === "in-progress"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {ticket?.status}
                </span>

                {/* Dropdown Icon */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="ml-2 focus:outline-none"
                >
                  <FaChevronDown className="text-foreground" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-2 bg-card border border-border rounded-lg shadow-lg">
                    <select
                      value={ticket?.status}
                      onChange={handleStatusChange}
                      className="appearance-none bg-transparent p-2 text-foreground focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-foreground">
              <span className="font-medium">Priority:</span>{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ticket?.priority === "high"
                    ? "bg-red-100 text-red-600"
                    : ticket?.priority === "medium"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {ticket?.priority}
              </span>
            </div>
            <div className="text-sm text-foreground">
              <span className="font-medium">Created At:</span>{" "}
              {new Date(ticket?.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Chat Section or Rating Section */}
        {ticket?.status !== "resolved" ? (
          <TicketChat ticketId={ticket.id} /> // Pass the ticketId to the TicketChat component
        ) : (
          <div className="bg-card rounded-xl shadow-soft border border-border p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Rate Our Service
            </h2>
            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={`cursor-pointer ${
                    index < rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                  onClick={() => handleRateService(index + 1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTicket;