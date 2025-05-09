const User = require("../../models/User");
const generateWorkId = require("../../utils/workersIdGenerator");

const userResolvers = {

  Query: {
    getUserProfile: async (_, __, context) => {
      // Ensure the user is authenticated
      if (!context.user) {
        throw new Error("Unauthorized: Please log in.");
      }

      // Fetch the user's profile
      const user = await User.findById(context.user.id);
      if (!user) {
        throw new Error("User not found.");
      }

      return user;
    },

    getRecentUsers: async (_, { limit }, { user: currentUser }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error("Unauthorized: Admin access only");
      }
      return await User.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    },

    getAllUsers: async (_, __, { user: currentUser }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error("Unauthorized: Admin access only");
      }
      return await User.find().sort({ createdAt: -1 });
    },
    
    getUserById: async (_, { id }, { user: currentUser }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error("Unauthorized: Admin access only");
      }
      return await User.findById(id);
    }
  },

  Mutation: {
    registerUser: async (_, { fullname, phone, email, dept, role }, { user: currentUser }) => {
      console.log("Current User:", currentUser); // Log the current user
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Unauthorized: Only admin can register new users.");
      }

      // Check if the email or phone is already in use
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        throw new Error("User with this email or phone already exists.");
      }

      // Generate unique work ID
      const workId = generateWorkId();

      // Create and save new user
      const newUser = new User({ workId, fullname, phone, email, dept, role: role || "user" });

      await newUser.save();
      return newUser;
    },

    updateUser: async (_, { id, ...updateData }, { user: currentUser }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error("Unauthorized: Admin access only");
      }
      return await User.findByIdAndUpdate(id, updateData, { new: true });
    },


    deleteUser: async (_, { id }, { user: currentUser }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error("Unauthorized: Admin access only");
      }
      await User.findByIdAndDelete(id);
      return true;
    }
  },
};

module.exports = userResolvers;
