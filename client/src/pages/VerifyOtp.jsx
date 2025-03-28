import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaKey } from "react-icons/fa";
import { Button, TextInput } from "../components";
import { useMutation } from "@apollo/client";
import { VERIFY_OTP } from "../apollo/mutations";
import { useDispatch } from "react-redux";
import { login } from "../redux/slices/authSlice";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [otp, setOtp] = useState("");
  const [verifyOtp, { loading, error }] = useMutation(VERIFY_OTP);

  const email = location.state?.email;

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const { data } = await verifyOtp({ variables: { email, otp } });
      if (data.verifyOtp.token) {
        // Dispatch login action to update Redux state
        dispatch(
          login({
            token: data.verifyOtp.token,
            role: data.verifyOtp.role,
          })
        );
        navigate(`/${data?.verifyOtp?.role}`); // Redirect to the user | admin dashboard
      }
    } catch (err) {
      alert("Invalid OTP. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-medium border border-border">
        <h2 className="text-2xl font-semibold text-foreground text-center mb-6">
          Verify OTP
        </h2>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <TextInput
            icon={FaKey}
            label="OTP"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">
            {error.message}
          </p>
        )}

        <p className="text-center text-foreground mt-4">
          Didn't receive the OTP?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-primary hover:underline"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;