import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  GET_TICKET_COUNTS,
  GET_TECHNICIAN_TICKETS,
  GET_RECENT_USERS
} from "../../apollo/queries";
import Loader from "./components/Loader";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);
  const [ticketCounts, setTicketCounts] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0
  });

  // Fetch ticket counts (used by both admin and technician)
  const { 
    data: countsData, 
    loading: countsLoading, 
    error: countsError 
  } = useQuery(GET_TICKET_COUNTS);

  // Fetch technician-specific data
  const { 
    data: techData, 
    loading: techLoading, 
    error: techError 
  } = useQuery(GET_TECHNICIAN_TICKETS, { 
    skip: role !== 'technician' 
  });

  // Fetch admin-specific data
  const { data: recentUsersData } = useQuery(GET_RECENT_USERS, {
    variables: { limit: 5 },
    skip: role !== 'admin'
  });

  useEffect(() => {
    if (countsData?.getTicketCounts) {
      setTicketCounts(countsData.getTicketCounts);
    }
  }, [countsData]);

  if (countsError || techError) {
    return <p>Error: {countsError?.message || techError?.message}</p>;
  }

  const loading = countsLoading || (role === 'technician' ? techLoading : false);
  const technicianTickets = techData?.getTechnicianTickets || [];

  // Calculate technician-specific counts from their assigned tickets
  const techTicketCounts = {
    open: technicianTickets.filter(t => t.status === 'open').length,
    inProgress: technicianTickets.filter(t => t.status === 'inProgress').length,
    resolved: technicianTickets.filter(t => t.status === 'resolved').length
  };

  // Redirect unauthorized users
  if (role !== 'admin' && role !== 'technician') {
    navigate('/');
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {role === 'technician' ? 'Technician Dashboard' : 'Admin Dashboard'}
      </h1>

      {/* Stats Section - Ticket Status Counts */}
      <div className="mb-8">
        {loading ? (
          <Loader type="skeleton" count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* <StatCard 
              title="Open Tickets"
              value={role === 'technician' ? techTicketCounts.open : ticketCounts.open}
              description="Tickets awaiting resolution"
              status="open"
            />
            <StatCard 
              title="In Progress"
              value={role === 'technician' ? techTicketCounts.inProgress : ticketCounts.inProgress}
              description="Tickets being worked on"
              status="inProgress"
            />
            <StatCard 
              title="Resolved"
              value={role === 'technician' ? techTicketCounts.resolved : ticketCounts.resolved}
              description="Completed tickets"
              status="resolved"
            /> */}
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {role === 'technician' ? 'Quick Actions' : 'Admin Actions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {role === 'technician' ? (
            <>
              <ActionCard 
                title="My Tickets"
                description="View all assigned tickets"
                onClick={() => navigate("/admin/tickets-list")}
              />
              <ActionCard 
                title="Report Issue"
                description="Submit a technical issue"
                onClick={() => navigate("/admin/new-ticket")}
              />
            </>
          ) : (
            <>
              <ActionCard 
                title="User Management"
                description="Add, edit or remove users"
                onClick={() => navigate("/admin/users")}
              />
              <ActionCard 
                title="Ticket Management"
                description="View and assign support tickets"
                onClick={() => navigate("/admin/tickets-list")}
              />
            </>
          )}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {role === 'technician' ? 'Recent Tickets' : 'Recent Activity'}
        </h2>
        <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
          {loading ? (
            <Loader type="spinner" />
          ) : role === 'technician' ? (
            <TicketList tickets={technicianTickets.slice(0, 5)} />
          ) : (
            <AdminActivityList recentUsers={recentUsersData?.getRecentUsers || []} />
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Stat Card Component with status styling
const StatCard = ({ title, value, description, status }) => {
  const statusColors = {
    open: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    inProgress: 'bg-blue-100 text-blue-800 border-blue-200',
    resolved: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <div className={`p-6 rounded-xl shadow-soft border ${statusColors[status]}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
};

// Reusable Action Card Component
const ActionCard = ({ title, description, onClick }) => (
  <button
    className="bg-card p-6 rounded-xl shadow-soft border border-border hover:bg-primary hover:text-white transition-all text-left"
    onClick={onClick}
  >
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </button>
);

// Technician Ticket List Component
const TicketList = ({ tickets }) => (
  <ul className="space-y-4">
    {tickets.map(ticket => (
      <li key={ticket.id} className="flex items-center justify-between">
        <div>
          <p className="text-foreground font-medium">
            {ticket.userId?.fullname || 'Unknown User'}
          </p>
          <p className="text-sm text-muted-foreground">
            {ticket.description.substring(0, 50)}...
          </p>
          <span className={`text-xs px-2 py-1 rounded ${
            ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {ticket.priority}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
      </li>
    ))}
  </ul>
);

// Admin Activity List Component
const AdminActivityList = ({ recentUsers }) => {
  if (recentUsers.length === 0) {
    return <p className="text-muted-foreground">No recent activity found</p>;
  }

  return (
    <ul className="space-y-4">
      {recentUsers.map(user => (
        <li key={user.id} className="flex items-center justify-between">
          <div>
            <p className="text-foreground font-medium">New user registered</p>
            <p className="text-sm text-muted-foreground">
              {user.fullname} ({user.role})
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default AdminDashboard;