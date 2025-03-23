import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export const ProtectedRoutes = () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  console.log("ProtectedRoutes - isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoutes - role:", role);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render nested routes based on role
  if (role === "admin" || role === "user") {
    return <Outlet />; // Render nested routes for admin or user
  }

  // Default fallback (if role is not recognized)
  return <Navigate to="/" replace />;
};