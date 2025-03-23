import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_ADMIN_DASHBOARD_DATA } from "../../apollo/queries";
import Loader from "./components/Loader";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    agentsOnline: 0
  });

  // Fetch admin dashboard data
  const {
    data,
    loading,
    error,
  } = useQuery(GET_ADMIN_DASHBOARD_DATA);

  useEffect(() => {
    if (data?.getAdminDashboardData) {
      setStats(data.getAdminDashboardData);
    }
  }, [data]);

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-4">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      {loading ? (
        <Loader type="skeleton" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users Card */}
          <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
            <h3 className="text-lg font-semibold text-foreground">Total Users</h3>
            <p className="text-foreground text-3xl font-bold">{stats.totalUsers}</p>
            <p className="text-sm text-gray-500">Registered users</p>
          </div>

          {/* Total Tickets Card */}
          <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
            <h3 className="text-lg font-semibold text-foreground">Total Tickets</h3>
            <p className="text-foreground text-3xl font-bold">{stats.totalTickets}</p>
            <p className="text-sm text-gray-500">All support tickets</p>
          </div>

          {/* Open Tickets Card */}
          <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
            <h3 className="text-lg font-semibold text-foreground">Open Tickets</h3>
            <p className="text-foreground text-3xl font-bold">{stats.openTickets}</p>
            <p className="text-sm text-gray-500">Tickets awaiting resolution</p>
          </div>

          {/* Resolved Tickets Card */}
          {/* <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
            <h3 className="text-lg font-semibold text-foreground">Resolved Tickets</h3>
            <p className="text-foreground text-3xl font-bold">{stats.resolvedTickets}</p>
            <p className="text-sm text-gray-500">Completed tickets</p>
          </div> */}

          {/* Agents Online Card */}
          {/* <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
            <h3 className="text-lg font-semibold text-foreground">Agents Online</h3>
            <p className="text-foreground text-3xl font-bold">{stats.agentsOnline}</p>
            <p className="text-sm text-gray-500">Available support staff</p>
          </div> */}

          
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Admin Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <button
            className="bg-card p-6 rounded-xl shadow-soft border border-border hover:bg-primary hover:text-white transition-all text-left"
            onClick={() => navigate("/admin/users")}
          >
            <h3 className="text-lg font-semibold">User Management</h3>
            <p className="text-sm text-gray-500">Add, edit or remove users</p>
          </button>

          {/* Ticket Management */}
          <button
            className="bg-card p-6 rounded-xl shadow-soft border border-border hover:bg-primary hover:text-white transition-all text-left"
            onClick={() => navigate("/admin/tickets-list")}
          >
            <h3 className="text-lg font-semibold">Ticket Management</h3>
            <p className="text-sm text-gray-500">View and assign support tickets</p>
          </button>

          {/* Reports */}
          {/* <button
            className="bg-card p-6 rounded-xl shadow-soft border border-border hover:bg-primary hover:text-white transition-all text-left"
            onClick={() => navigate("/admin/reports")}
          >
            <h3 className="text-lg font-semibold">Reports</h3>
            <p className="text-sm text-gray-500">View statistics and analytics</p>
          </button> */}

          {/* Knowledge Base Management */}
          <button
            className="bg-card p-6 rounded-xl shadow-soft border border-border hover:bg-primary hover:text-white transition-all text-left"
            onClick={() => navigate("/admin/knowledge-base")}
          >
            <h3 className="text-lg font-semibold">Knowledge Base</h3>
            <p className="text-sm text-gray-500">Manage support articles</p>
          </button>

          {/* System Settings */}
          {/* <button
            className="bg-card p-6 rounded-xl shadow-soft border border-border hover:bg-primary hover:text-white transition-all text-left"
            onClick={() => navigate("/admin/settings")}
          >
            <h3 className="text-lg font-semibold">System Settings</h3>
            <p className="text-sm text-gray-500">Configure application settings</p>
          </button> */}

          {/* Agent Management */}
          {/* <button
            className="bg-card p-6 rounded-xl shadow-soft border border-border hover:bg-primary hover:text-white transition-all text-left"
            onClick={() => navigate("/admin/agents")}
          >
            <h3 className="text-lg font-semibold">Agent Management</h3>
            <p className="text-sm text-gray-500">Manage support staff</p>
          </button> */}
        </div>
      </div>

      {/* Recent Activity (simplified) */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
          {loading ? (
            <Loader type="spinner" />
          ) : (
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">New user registered</p>
                  <p className="text-sm text-gray-500">John Doe created an account</p>
                </div>
                <span className="text-sm text-gray-500">10 minutes ago</span>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Knowledge base updated</p>
                  <p className="text-sm text-gray-500">Article: "How to reset password"</p>
                </div>
                <span className="text-sm text-gray-500">3 hours ago</span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;