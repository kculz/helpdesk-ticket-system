
import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  GET_ADMIN_DASHBOARD_DATA, 
  GET_TECHNICIAN_TICKETS 
} from "../../apollo/queries";
import Loader from "./components/Loader";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    agentsOnline: 0
  });

  // Fetch data based on user role
  const { 
    data: adminData, 
    loading: adminLoading, 
    error: adminError 
  } = useQuery(GET_ADMIN_DASHBOARD_DATA, { 
    skip: role !== 'admin' 
  });

  const { 
    data: techData, 
    loading: techLoading, 
    error: techError 
  } = useQuery(GET_TECHNICIAN_TICKETS, { 
    skip: role !== 'technician' 
  });

  useEffect(() => {
    if (role === 'admin' && adminData?.getAdminDashboardData) {
      setStats(adminData.getAdminDashboardData);
    }
  }, [adminData, role]);

  if (adminError || techError) {
    return <p>Error: {adminError?.message || techError?.message}</p>;
  }

  const loading = (role === 'admin' ? adminLoading : techLoading);
  const technicianTickets = techData?.getTechnicianTickets || [];

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

      {/* Stats Section */}
      <div className="mb-8">
        {loading ? (
          <Loader type="skeleton" count={3} />
        ) : role === 'technician' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Assigned Tickets"
              value={technicianTickets.length}
              description="Your assigned tickets"
            />
            <StatCard 
              title="Open Tickets"
              value={technicianTickets.filter(t => t.status === 'open').length}
              description="Tickets to resolve"
            />
            <StatCard 
              title="Resolved Tickets"
              value={technicianTickets.filter(t => t.status === 'resolved').length}
              description="Completed tickets"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <StatCard 
              title="Total Users"
              value={stats.totalUsers}
              description="Registered users"
            />
            <StatCard 
              title="Total Tickets"
              value={stats.totalTickets}
              description="All support tickets"
            />
            <StatCard 
              title="Open Tickets"
              value={stats.openTickets}
              description="Tickets awaiting resolution"
            />
            <StatCard 
              title="Resolved Tickets"
              value={stats.resolvedTickets}
              description="Completed tickets"
            />
            <StatCard 
              title="Agents Online"
              value={stats.agentsOnline}
              description="Available support staff"
            />
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
                title="Open Tickets"
                description="View pending tickets"
                onClick={() => navigate("/admin/tickets-list?status=open")}
              />
              <ActionCard 
                title="Knowledge Base"
                description="View support articles"
                onClick={() => navigate("/admin/knowledge-base")}
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
              <ActionCard 
                title="Knowledge Base"
                description="Manage support articles"
                onClick={() => navigate("/admin/knowledge-base")}
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
            <AdminActivityList />
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, description }) => (
  <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-foreground text-3xl font-bold">{value}</p>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

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
const AdminActivityList = () => (
  <ul className="space-y-4">
    <li className="flex items-center justify-between">
      <div>
        <p className="text-foreground font-medium">New user registered</p>
        <p className="text-sm text-muted-foreground">John Doe created an account</p>
      </div>
      <span className="text-sm text-muted-foreground">10 minutes ago</span>
    </li>
    <li className="flex items-center justify-between">
      <div>
        <p className="text-foreground font-medium">Knowledge base updated</p>
        <p className="text-sm text-muted-foreground">Article: "How to reset password"</p>
      </div>
      <span className="text-sm text-muted-foreground">3 hours ago</span>
    </li>
  </ul>
);

export default AdminDashboard;