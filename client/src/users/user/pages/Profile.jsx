import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { TextInput } from "../../../components"; // Import the TextInput component
import { FaUser, FaPhone, FaEnvelope, FaBuilding, FaIdBadge } from "react-icons/fa";
import { GET_USER_PROFILE } from "../../../apollo/queries"; // Import the query
import Loader from "../components/Loader";

const Profile = () => {
  // Fetch the authenticated user's profile
  const { data, loading, error } = useQuery(GET_USER_PROFILE);

  // State for editable fields
  const [formData, setFormData] = useState({
    workId: "",
    fullname: "",
    phone: "",
    email: "",
    dept: "",
    role: "",
  });

  // Update form data when the profile is fetched
  useEffect(() => {
    if (data?.getUserProfile) {
      setFormData(data.getUserProfile);
    }
  }, [data]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Update user data (you can send this to the backend)
    alert("Profile updated successfully!");
  };

  if (loading) return <Loader type="profile" />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Your Profile</h1>

        {/* Profile Information Card */}
        <div className="bg-card rounded-xl shadow-soft border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Personal Information
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Work ID */}
            <TextInput
              icon={FaIdBadge}
              label="Work ID"
              name="workId"
              value={formData.workId}
              onChange={handleChange}
              placeholder="Enter Work ID"
              readOnly // Work ID is not editable
            />

            {/* Full Name */}
            <TextInput
              icon={FaUser}
              label="Full Name"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Enter Full Name"
              required
            />

            {/* Phone */}
            <TextInput
              icon={FaPhone}
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter Phone Number"
              required
            />

            {/* Email */}
            <TextInput
              icon={FaEnvelope}
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              required
            />

            {/* Department */}
            <TextInput
              icon={FaBuilding}
              label="Department"
              name="dept"
              value={formData.dept}
              onChange={handleChange}
              placeholder="Enter Department"
              required
            />

            {/* Role (Read-only) */}
            <TextInput
              icon={FaUser}
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Role"
              readOnly // Role is not editable
            />
          </form>

          {/* Submit Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full md:w-auto mt-6 bg-primary text-white py-2 px-6 rounded-lg hover:bg-secondary transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Update Profile
          </button>
        </div>

        {/* Additional Information Card (Optional) */}
        <div className="bg-card rounded-xl shadow-soft border border-border p-6 mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Additional Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-sm text-foreground">
              <span className="font-medium">Work ID:</span> {formData.workId}
            </div>
            <div className="text-sm text-foreground">
              <span className="font-medium">Role:</span> {formData.role}
            </div>
            <div className="text-sm text-foreground">
              <span className="font-medium">Department:</span> {formData.dept}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;