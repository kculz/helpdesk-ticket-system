import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoutes = () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  console.log("ProtectedRoutes - isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoutes - role:", role);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render nested routes based on role
  if (role === "admin" || role === "technician" || role === "user") {
    return <Outlet />; // Render nested routes for admin, technician, or user
  }

  // Default fallback (if role is not recognized)
  return <Navigate to="/" replace />;
};