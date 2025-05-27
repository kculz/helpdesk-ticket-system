import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { FaStar, FaChevronDown, FaCalendarAlt, FaTag, FaExclamationCircle } from "react-icons/fa";
import TicketChat from "./TicketChat"; // Import the TicketChat component
import { GET_TICKET } from "../../../apollo/queries"; // Import the GET_TICKET query
import { UPDATE_TICKET_STATUS } from "../../../apollo/mutations"; // Import the mutation
import Loader from "../components/Loader";

const ViewTicket = () => {
  const { id } = useParams(); // Get the ticket ID from the URL
  const [rating, setRating] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to manage dropdown visibility

  // Fetch ticket details
  const { loading, error, data, refetch } = useQuery(GET_TICKET, {
    variables: { id },
  });

  // Mutation to update ticket status
  const [updateTicketStatus] = useMutation(UPDATE_TICKET_STATUS);

  // Enhanced date formatting function
  const formatDate = (dateInput) => {
    if (!dateInput) return "N/A";

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
        return "Invalid Date";
      }

      // Return formatted date with time
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting date:", error, "Input:", dateInput);
      return "Invalid Date";
    }
  };

  // Helper function to get relative time
  const getRelativeTime = (dateInput) => {
    if (!dateInput) return "Unknown time";

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

      if (isNaN(date.getTime())) return "Unknown time";

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSeconds < 60) {
        return "Just now";
      } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 30) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else {
        return formatDate(dateInput);
      }
    } catch (error) {
      return "Unknown time";
    }
  };

  // Helper function to get full date tooltip
  const getFullDateTooltip = (dateInput) => {
    if (!dateInput) return "No date available";

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

      if (isNaN(date.getTime())) return "Invalid date";

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
      return "Invalid date";
    }
  };

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
      await refetch();

      alert("Ticket status updated successfully!");
    } catch (error) {
      console.error("Error updating ticket status:", error);
      alert("Failed to update ticket status.");
    }
  };

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get priority styling
  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) return <Loader type="viewTicket" />;
  
  if (error) {
    return (
      <div className="bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <FaExclamationCircle className="text-red-500 text-xl" />
              <div>
                <h2 className="text-lg font-semibold text-red-800">Error Loading Ticket</h2>
                <p className="text-red-700">{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ticket = data?.getTicket;

  if (!ticket) {
    return (
      <div className="bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Ticket Not Found</h2>
            <p className="text-yellow-700">The ticket you're looking for doesn't exist or may have been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Ticket #{ticket.id ? ticket.id.slice(-8) : 'N/A'}
          </h1>
          <p className="text-gray-600">
            {getRelativeTime(ticket.createdAt)}
          </p>
        </div>

        {/* Ticket Details */}
        <div className="bg-card rounded-xl shadow-soft border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <FaTag className="text-primary" />
            Ticket Details
          </h2>
          
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-foreground bg-gray-50 p-4 rounded-lg border">
              {ticket.description || 'No description provided'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ticket ID */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Ticket ID</div>
              <div className="text-foreground font-mono bg-gray-50 px-3 py-2 rounded-lg border">
                #{ticket.id ? ticket.id.slice(-8) : 'N/A'}
              </div>
            </div>

            {/* Status with Dropdown */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-2 rounded-lg text-sm font-medium border capitalize ${getStatusStyle(ticket.status)}`}
                  >
                    {ticket.status?.replace('-', ' ') || 'unknown'}
                  </span>

                  {/* Dropdown Toggle */}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                    title="Change status"
                  >
                    <FaChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-20 min-w-40">
                    <div className="py-1">
                      {['open', 'in-progress', 'resolved', 'closed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            const event = { target: { value: status } };
                            handleStatusChange(event);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize ${
                            ticket.status === status ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                          }`}
                        >
                          {status.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Priority</div>
              <span
                className={`inline-block px-3 py-2 rounded-lg text-sm font-medium border capitalize ${getPriorityStyle(ticket.priority)}`}
              >
                {ticket.priority || 'normal'}
              </span>
            </div>

            {/* Created Date */}
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <FaCalendarAlt className="text-xs" />
                Created
              </div>
              <div className="space-y-1">
                <div 
                  className="text-foreground cursor-help"
                  title={getFullDateTooltip(ticket.createdAt)}
                >
                  {formatDate(ticket.createdAt)}
                </div>
                <div className="text-sm text-gray-500">
                  {getRelativeTime(ticket.createdAt)}
                </div>
              </div>
            </div>

            {/* Category (if available) */}
            {ticket.category && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Category</div>
                <div className="text-foreground capitalize bg-gray-50 px-3 py-2 rounded-lg border">
                  {ticket.category}
                </div>
              </div>
            )}

            {/* Assigned To (if available) */}
            {ticket.assignedTo && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Assigned To</div>
                <div className="text-foreground bg-gray-50 px-3 py-2 rounded-lg border">
                  {ticket.assignedTo.name || ticket.assignedTo.email || 'Unknown'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Section or Rating Section */}
        {ticket.status !== "resolved" && ticket.status !== "closed" ? (
          <div className="bg-card rounded-xl shadow-soft border border-border overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Support Chat</h2>
              <p className="text-sm text-gray-600 mt-1">
                Communicate with our support team in real-time
              </p>
            </div>
            <TicketChat ticketId={ticket.id} />
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-soft border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              Rate Our Service
            </h2>
            <p className="text-gray-600 mb-4">
              Your ticket has been resolved. How would you rate our support service?
            </p>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={`cursor-pointer text-2xl transition-colors ${
                    index < rating ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                  }`}
                  onClick={() => handleRateService(index + 1)}
                />
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-3">
                Thank you for rating our service {rating} star{rating > 1 ? 's' : ''}!
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ViewTicket;