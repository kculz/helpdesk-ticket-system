import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

// Load initial state from localStorage
const preloadedState = {
  auth: JSON.parse(localStorage.getItem("auth")) || {
    token: null,
    role: null,
    isAuthenticated: false,
  },
};

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState, // Initialize store with persisted state
});

export default store;