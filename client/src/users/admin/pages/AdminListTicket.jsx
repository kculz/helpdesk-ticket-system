import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_ALL_TICKETS, GET_TECHNICIAN_TICKETS } from '../../../apollo/queries';
import Loader from '../components/Loader';
import { useSelector } from 'react-redux';

const AdminTicketList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const { role } = useSelector((state) => state.auth);

  // Fetch tickets based on user role
  const { 
    data: adminData, 
    loading: adminLoading, 
    error: adminError 
  } = useQuery(GET_ALL_TICKETS, {
    skip: role !== 'admin' // Skip if not admin
  });

  const { 
    data: techData, 
    loading: techLoading, 
    error: techError 
  } = useQuery(GET_TECHNICIAN_TICKETS, {
    skip: role === 'admin' // Skip if admin
  });

  const loading = role === 'admin' ? adminLoading : techLoading;
  const error = role === 'admin' ? adminError : techError;

  // Helper function to safely format dates
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    try {
      // Handle different date formats
      let date;
      if (typeof dateValue === 'string') {
        // Try parsing as timestamp first, then as date string
        const timestamp = parseInt(dateValue);
        if (!isNaN(timestamp) && timestamp.toString() === dateValue) {
          date = new Date(timestamp);
        } else {
          date = new Date(dateValue);
        }
      } else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      } else {
        date = new Date(dateValue);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      // Format the date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Date value:', dateValue);
      return 'Invalid Date';
    }
  };


  if (loading) return <Loader type="spinner" />;
  if (error) {
    console.error('GraphQL Error:', error);
    return <p>Error: {error.message}</p>;
  }

  // Get tickets based on role
  const tickets = role === 'admin' 
    ? adminData?.getAllTickets || []
    : techData?.getTechnicianTickets || [];

  // Debug logging
  console.log('Tickets data:', tickets);
  if (tickets.length > 0) {
    console.log('Sample ticket structure:', tickets[0]);
  }

  // Filter and sort tickets
  const filteredTickets = tickets.filter(ticket => {
    if (filters.status !== 'all' && ticket.status !== filters.status) return false;
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false;
    return true;
  }).sort((a, b) => {
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

  // Handle ticket navigation
  const handleTicketView = (ticketId) => {
    navigate(`/admin/ticket/${ticketId}`);
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'open': return 'bg-yellow-500';
      case 'in-progress': return 'bg-primary';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground mb-4">
        {role === 'admin' ? 'Ticket Management' : 'My Tickets'}
      </h1>
      
      {/* Filters */}
      <div className="bg-card p-4 rounded-xl shadow-soft border border-border mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select 
              className="px-3 py-2 bg-background border border-border rounded-md"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select 
              className="px-3 py-2 bg-background border border-border rounded-md"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <select 
              className="px-3 py-2 bg-background border border-border rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Date Created</option>
            </select>
          </div>
          
          {/* Sort Direction */}
          <div>
            <label className="block text-sm font-medium mb-1">Direction</label>
            <select 
              className="px-3 py-2 bg-background border border-border rounded-md"
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Tickets Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </p>
      </div>
      
      {/* Tickets Table */}
      <div className="bg-card rounded-xl shadow-soft border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-background cursor-pointer transition-colors duration-150"
                    onClick={() => handleTicketView(ticket.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      #{ticket.id ? ticket.id.slice(-6) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm" title={ticket.description}>
                      {ticket.description && ticket.description.length > 50 
                        ? ticket.description.substring(0, 50) + '...' 
                        : ticket.description || 'No description'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full text-white capitalize ${getStatusBadgeClass(ticket.status)}`}>
                        {ticket.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full text-white capitalize ${getPriorityBadgeClass(ticket.priority)}`}>
                        {ticket.priority || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors duration-150"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTicketView(ticket.id);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={role === 'admin' ? 7 : 6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No tickets found</p>
                      {(filters.status !== 'all' || filters.priority !== 'all') && (
                        <p className="text-xs">Try adjusting your filters</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default AdminTicketList;