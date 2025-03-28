import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { Button, TextInput } from "../components";
import { useMutation } from "@apollo/client";
import { SEND_OTP } from "../apollo/mutations";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice"; // Import your logout action
import {jwtDecode} from "jwt-decode"; // For token expiration check

const SendOtp = () => {
  const [email, setEmail] = useState("");
  const [sendOtp, { loading, error }] = useMutation(SEND_OTP);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  // Check token validity on component mount
  useEffect(() => {
    const checkTokenValidity = () => {
      if (auth.token) {
        try {
          const decodedToken = jwtDecode(auth.token);
          const currentTime = Date.now() / 1000; // Convert to seconds

          if (decodedToken.exp < currentTime) {
            // Token expired
            dispatch(logout()); // Clear Redux state
            localStorage.removeItem("auth"); // Clear localStorage
            navigate("/"); // Redirect to home
          } else if (auth.role) {
            // Token valid and role exists
            navigate(`/${auth.role}`);
          }
        } catch (error) {
          console.error("Token decoding failed:", error);
          dispatch(logout());
          localStorage.removeItem("auth");
          navigate("/");
        }
      }
    };

    checkTokenValidity();
  }, [auth.token, auth.role, navigate, dispatch]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    // Re-check token validity before sending OTP
    if (auth.token) {
      try {
        const decodedToken = jwtDecode(auth.token);
        if (decodedToken.exp > Date.now() / 1000 && auth.role) {
          navigate(`/${auth.role}`);
          return;
        }
      } catch (error) {
        console.error("Token check failed:", error);
      }
    }

    try {
      await sendOtp({ variables: { email } });
      alert("OTP sent to your email!");
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      alert("Failed to send OTP. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-medium border border-border">
        <h2 className="text-2xl font-semibold text-foreground text-center mb-6">
          Login to Your Account
        </h2>

        <form onSubmit={handleSendOtp} className="space-y-4">
          <TextInput
            icon={FaUser}
            label="Email"
            placeholder="Enter Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default SendOtp;