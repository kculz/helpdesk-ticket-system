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

  if (loading) return <Loader type="spinner" />;
  if (error) return <p>Error: {error.message}</p>;

  // Get tickets based on role
  const tickets = role === 'admin' 
    ? adminData?.getAllTickets || []
    : techData?.getTechnicianTickets || [];

  // Filter and sort tickets
  const filteredTickets = tickets.filter(ticket => {
    if (filters.status !== 'all' && ticket.status !== filters.status) return false;
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'createdAt') {
      return sortDirection === 'desc' 
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt);
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
                {role === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-background cursor-pointer"
                    onClick={() => handleTicketView(ticket.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{ticket.id.slice(-6)}</td>
                    <td className="px-6 py-4 text-sm">
                      {ticket.description.length > 50 
                        ? ticket.description.substring(0, 50) + '...' 
                        : ticket.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusBadgeClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full text-white ${getPriorityBadgeClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    {role === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {ticket.user?.fullname || 'Unknown'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Action for ticket ${ticket.id}`);
                          }}
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={role === 'admin' ? 7 : 6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No tickets found
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