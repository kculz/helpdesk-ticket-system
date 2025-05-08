import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { GET_USER_BY_ID } from '../../../apollo/queries';
import { DELETE_USER, UPDATE_USER } from '../../../apollo/mutations';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_USER_BY_ID, { variables: { id } });
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    dept: '',
    role: ''
  });

  // Populate form when data loads
  useEffect(() => {
    if (data?.getUserById) {
      setFormData({
        fullname: data.getUserById.fullname,
        phone: data.getUserById.phone,
        email: data.getUserById.email,
        dept: data.getUserById.dept,
        role: data.getUserById.role
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ variables: { id, ...formData } });
      alert('User updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error updating user');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser({ variables: { id } });
        alert('User deleted successfully!');
        navigate('/admin/users');
      } catch (err) {
        console.error(err);
        alert('Error deleting user');
      }
    }
  };

  if (loading) return <Loader />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Edit User</h2>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
        >
          Delete User
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Department</label>
          <input
            type="text"
            name="dept"
            value={formData.dept}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="user">User</option>
            <option value="technician">Technician</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Update User
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserDetails;