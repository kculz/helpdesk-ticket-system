import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { Button, TextInput } from "../components";
import { useMutation } from "@apollo/client";
import { SEND_OTP } from "../apollo/mutations"; // Replace with your GraphQL mutation

const SendOtp = () => {
  const [email, setEmail] = useState("");
  const [sendOtp, { loading, error }] = useMutation(SEND_OTP);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await sendOtp({ variables: { email } });
      alert("OTP sent to your email!");
      navigate("/verify-otp", { state: { email } }); // Redirect to VerifyOtp page
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
          {/* Email Field */}
          <TextInput
            icon={FaUser}
            label="Email"
            placeholder="Enter Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>

        {/* Error Message */}
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