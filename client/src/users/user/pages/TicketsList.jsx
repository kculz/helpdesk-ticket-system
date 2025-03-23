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
                    {new Date(ticket.createdAt).toLocaleDateString()}
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