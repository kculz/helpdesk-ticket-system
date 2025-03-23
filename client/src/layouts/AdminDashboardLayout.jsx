import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom"; // Import useNavigate
import { FiMenu, FiX, FiHome, FiUser, FiLogOut } from "react-icons/fi";
import Header from "./Header";

const AdminDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle logout
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("isAuthenticated");

    // Redirect to the login or home page
    navigate("/"); // Change this to your login route if needed
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 w-64 bg-card border-r border-border 
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static
          flex flex-col justify-between
        `}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
          <nav className="mt-6">
            <ul className="space-y-2">
              {/* Home */}
              <li>
                <a
                  href="/admin"
                  className="flex items-center p-2 text-foreground bg-primary/10 hover:bg-primary hover:text-white rounded-lg"
                >
                  <FiHome className="mr-3" size={20} />
                  <span>Home</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Profile and Logout at the Bottom */}
        <div className="p-6 border-t border-border">
          <ul className="space-y-2">
            {/* Profile */}
            <li>
              <a
                href="/admin/profile"
                className="flex items-center p-2 text-foreground bg-primary/10 hover:bg-primary hover:text-white rounded-lg"
              >
                <FiUser className="mr-3" size={20} />
                <span>Profile</span>
              </a>
            </li>

            {/* Logout */}
            <li>
              <button
                onClick={handleLogout} // Call handleLogout on click
                className="w-full flex items-center p-2 text-foreground bg-primary/10 hover:bg-primary hover:text-white rounded-lg"
              >
                <FiLogOut className="mr-3" size={20} />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-foreground focus:outline-none"
          >
            {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </Header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;