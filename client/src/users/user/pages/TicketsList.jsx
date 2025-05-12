import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_USER_TICKETS } from "../../../apollo/queries";
import Loader from "../components/Loader";

const TicketsList = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("All");

  // Fetch tickets for the authenticated user
  const { data, loading, error } = useQuery(GET_USER_TICKETS);

  // Filter tickets based on status
  const filteredTickets =
    filterStatus === "All"
      ? data?.getUserTickets || []
      : data?.getUserTickets.filter((ticket) => ticket.status === filterStatus) || [];

  if (error) return <p>Error: {error.message}</p>;

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

  return (
    <div className="p-6 bg-background">
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        Your Support Tickets
      </h1>

      {/* Filter Options */}
      <div className="mb-6">
        <label className="text-sm font-medium text-foreground mr-4">
          Filter by Status:
        </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="All">All</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Tickets Table */}
      {loading ? (
        <Loader type="ticketsList" /> // Use Custom Loader
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-card border-b border-border">
                <th className="p-3 text-left text-sm font-medium text-foreground">
                  Ticket ID
                </th>
                <th className="p-3 text-left text-sm font-medium text-foreground">
                  Description
                </th>
                <th className="p-3 text-left text-sm font-medium text-foreground">
                  Status
                </th>
                <th className="p-3 text-left text-sm font-medium text-foreground">
                  Priority
                </th>
                <th className="p-3 text-left text-sm font-medium text-foreground">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-border hover:bg-card/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/user/ticket/${ticket.id}`)}
                >
                  <td className="p-3 text-sm text-foreground">#{ticket.id}</td>
                  <td className="p-3 text-sm text-foreground">
                    {ticket.description}
                  </td>
                  <td className="p-3 text-sm text-foreground">
                    <span
                      className={`px-2 py-1 truncate rounded-full text-xs font-medium ${
                        ticket.status === "open"
                          ? "bg-red-100 text-red-600"
                          : ticket.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-foreground">
                    <span
                      className={`px-2 py-1 truncate rounded-full text-xs font-medium ${
                        ticket.priority === "high"
                          ? "bg-red-100 text-red-600"
                          : ticket.priority === "medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="p-3 truncate text-sm text-foreground">
                    {formatDate(ticket.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketsList;