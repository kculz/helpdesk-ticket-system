import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { Navigate } from "react-router-dom";

const Logout = () => {
  const dispatch = useDispatch();
  dispatch(logout()); // Dispatch logout action
  return <Navigate to="/login" replace />; // Redirect to login page
};

export default Logout;