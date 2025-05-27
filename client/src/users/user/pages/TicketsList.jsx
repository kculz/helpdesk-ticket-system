import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_USER_TICKETS } from "../../../apollo/queries";
import Loader from "../components/Loader";

const TicketsList = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Fetch tickets for the authenticated user
  const { data, loading, error } = useQuery(GET_USER_TICKETS);

  // Enhanced date formatting function for tickets list
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

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      // For tickets list, we want to show more detailed information
      if (diffSeconds < 60) {
        return "Just now";
      } else if (diffMinutes < 60) {
        return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        // Show full date for older tickets
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (error) {
      console.error("Error formatting date:", error, "Input:", dateInput);
      return "Invalid Date";
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

  // Filter and sort tickets
  const processedTickets = React.useMemo(() => {
    let tickets = data?.getUserTickets || [];
    
    // Filter by status
    if (filterStatus !== "All") {
      tickets = tickets.filter((ticket) => 
        ticket.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Sort tickets
    tickets = [...tickets].sort((a, b) => {
      if (sortBy === 'createdAt') {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        
        // Handle invalid dates
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
      }
      return 0;
    });

    return tickets;
  }, [data?.getUserTickets, filterStatus, sortBy, sortDirection]);

  // Get status badge styling
  const getStatusBadgeClass = (status) => {
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

  // Get priority badge styling
  const getPriorityBadgeClass = (priority) => {
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

  if (error) {
    console.error('GraphQL Error:', error);
    return (
      <div className="p-6 bg-background">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Tickets</h2>
          <p className="text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background">
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        Your Support Tickets
      </h1>

      {/* Filters and Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium text-foreground mr-2">
            Filter by Status:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            <option value="All">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div>
          <label className="text-sm font-medium text-foreground mr-2">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background mr-2"
          >
            <option value="createdAt">Date Created</option>
          </select>
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
            className="p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Tickets Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {processedTickets.length} of {data?.getUserTickets?.length || 0} tickets
        </p>
      </div>

      {/* Tickets Table */}
      {loading ? (
        <Loader type="ticketsList" />
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="p-4 text-left text-sm font-medium text-foreground">
                    Ticket ID
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-foreground">
                    Description
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-foreground">
                    Status
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-foreground">
                    Priority
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-foreground">
                    Created
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedTickets.length > 0 ? (
                  processedTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-border hover:bg-background/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/user/ticket/${ticket.id}`)}
                    >
                      <td className="p-4 text-sm text-foreground font-mono">
                        #{ticket.id ? ticket.id.slice(-8) : 'N/A'}
                      </td>
                      <td className="p-4 text-sm text-foreground max-w-xs">
                        <div className="truncate" title={ticket.description}>
                          {ticket.description && ticket.description.length > 60
                            ? ticket.description.substring(0, 60) + '...'
                            : ticket.description || 'No description'}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusBadgeClass(ticket.status)}`}
                        >
                          {ticket.status?.replace('-', ' ') || 'unknown'}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getPriorityBadgeClass(ticket.priority)}`}
                        >
                          {ticket.priority || 'normal'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-foreground" title={getFullDateTooltip(ticket.createdAt)}>
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="p-4 text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/user/ticket/${ticket.id}`);
                          }}
                          className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-3">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No tickets found</p>
                        {filterStatus !== "All" ? (
                          <p className="text-sm">
                            No tickets with status "{filterStatus}". Try changing the filter.
                          </p>
                        ) : (
                          <p className="text-sm">
                            You haven't created any support tickets yet.
                          </p>
                        )}
                        <button
                          onClick={() => navigate('/user/create-ticket')}
                          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Create Your First Ticket
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default TicketsList;