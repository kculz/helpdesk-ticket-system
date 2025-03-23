import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import CreateTicket from "./pages/CreateTicket";
import { GET_TICKET_COUNTS, GET_RECENT_TICKETS } from "../../apollo/queries";
import Loader from "./components/Loader";


const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch ticket counts
  const {
    data: countsData,
    loading: countsLoading,
    error: countsError,
  } = useQuery(GET_TICKET_COUNTS);

  // Fetch recent tickets
  const {
    data: recentTicketsData,
    loading: recentTicketsLoading,
    error: recentTicketsError,
  } = useQuery(GET_RECENT_TICKETS);

  if (countsError) return <p>Error: {countsError.message}</p>;
  if (recentTicketsError) return <p>Error: {recentTicketsError.message}</p>;

  const { open, inProgress, resolved } = countsData?.getTicketCounts || {};
  const recentTickets = recentTicketsData?.getRecentTickets || [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-4">
        Your Support Tickets
      </h1>

      {/* Ticket Counts Cards */}
      {countsLoading || recentTicketsLoading ? (
        <Loader type="skeleton" /> // Use Skeleton Loader
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Open Tickets Card */}
          <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
            <h3 className="text-lg font-semibold text-foreground">Open Tickets</h3>
            <p className="text-foreground text-3xl font-bold">{open || 0}</p>
            <p className="text-sm text-gray-500">Tickets awaiting resolution</p>
          </div>

          {/* In Progress Tickets Card */}
          <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
            <h3 className="text-lg font-semibold text-foreground">In Progress</h3>
            <p className="text-foreground text-3xl font-bold">{inProgress || 0}</p>
            <p className="text-sm text-gray-500">Tickets being worked on</p>
          </div>

          {/* Resolved Tickets Card */}
          <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
            <h3 className="text-lg font-semibold text-foreground">Resolved Tickets</h3>
            <p className="text-foreground text-3xl font-bold">{resolved || 0}</p>
            <p className="text-sm text-gray-500">Tickets resolved</p>
          </div>
        </div>
      )}

      {/* Recent Tickets Section */}
      {countsLoading || recentTicketsLoading ? (
        <Loader type="spinner" /> // Use Spinner Loader
      ) : (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Tickets</h2>
          <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
            <ul className="space-y-4">
              {recentTickets.map((ticket) => (
                <li key={ticket.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">Ticket #{ticket.id}</p>
                    <p className="text-sm text-gray-500 md:pr-20 pr-10">{ticket.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm rounded-full text-white ${
                      ticket.status === "open"
                        ? "bg-yellow-500"
                        : ticket.status === "in-progress"
                        ? "bg-primary"
                        : "bg-green-500"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* New Ticket Button */}
          <button
            className="bg-card p-6 rounded-xl shadow-soft border border-border hover:bg-primary hover:text-white transition-all text-left"
            onClick={() => setIsModalOpen(true)}
          >
            <h3 className="text-lg font-semibold">Create New Ticket</h3>
            <p className="text-sm text-gray-500">Submit a new support request</p>
          </button>

          {/* Create Ticket Modal */}
          <CreateTicket isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

          {/* Knowledge Base Button */}
          <button
            className="bg-card p-6 rounded-xl shadow-soft border border-border hover:bg-primary hover:text-white transition-all text-left"
            onClick={() => navigate("/user/knowledge-base")}
          >
            <h3 className="text-lg font-semibold">Knowledge Base</h3>
            <p className="text-sm text-gray-500">Find answers to common questions</p>
          </button>

          {/* View All Tickets Button */}
          <button
            className="bg-card p-6 rounded-xl shadow-soft border border-border hover:bg-primary hover:text-white transition-all text-left"
            onClick={() => navigate("/user/tickets-list")}
          >
            <h3 className="text-lg font-semibold">View All Tickets</h3>
            <p className="text-sm text-gray-500">See all your support tickets</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;