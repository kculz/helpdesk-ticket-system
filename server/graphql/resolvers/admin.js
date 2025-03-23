const User = require("../../models/User");
const Ticket = require("../../models/Ticket");
const { checkRole } = require("../../utils/checkRole"); 

const adminResolvers = {
  Query: {
    getAdminDashboardData: async (_, __, { user }) => {
      // Check if user is admin
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      
      try {
        // Get counts for dashboard metrics
        const totalUsers = await User.countDocuments();
        const totalTickets = await Ticket.countDocuments();
        const openTickets = await Ticket.countDocuments({ status: "open" });
        const resolvedTickets = await Ticket.countDocuments({ status: "resolved" });
        
        // This would typically come from a separate model or service that tracks online status
        // For now, we'll just return a placeholder value
        const agentsOnline = 3; 
        
        return {
          totalUsers,
          totalTickets,
          openTickets,
          resolvedTickets,
          agentsOnline
        };
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        throw new Error("Failed to fetch admin dashboard data");
      }
    },
    
    getAllUsers: async (_, __, { user }) => {
      // Check if user is admin
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      
      try {
        return await User.find().sort({ createdAt: -1 });
      } catch (error) {
        console.error("Error fetching all users:", error);
        throw new Error("Failed to fetch users");
      }
    },
    
    getAdminReports: async (_, { period = "week" }, { user }) => {
      // Check if user is admin
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      
      try {
        // Get date range based on period
        const now = new Date();
        let startDate = new Date();
        
        if (period === "day") {
          startDate.setDate(now.getDate() - 1);
        } else if (period === "week") {
          startDate.setDate(now.getDate() - 7);
        } else if (period === "month") {
          startDate.setMonth(now.getMonth() - 1);
        } else if (period === "year") {
          startDate.setFullYear(now.getFullYear() - 1);
        }
        
        // Tickets by status
        const statuses = ["open", "in-progress", "resolved"];
        const ticketsByStatus = await Promise.all(
          statuses.map(async (status) => {
            const count = await Ticket.countDocuments({ 
              status,
              createdAt: { $gte: startDate }
            });
            return { status, count };
          })
        );
        
        // Tickets by priority
        const priorities = ["low", "medium", "high"];
        const ticketsByPriority = await Promise.all(
          priorities.map(async (priority) => {
            const count = await Ticket.countDocuments({ 
              priority,
              createdAt: { $gte: startDate }
            });
            return { priority, count };
          })
        );
        
        // Tickets over time (simplified for this example)
        const ticketsOverTime = [];
        
        // For simplicity, we'll just create some sample time series data
        // In a real implementation, you would query the database with date aggregation
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const count = await Ticket.countDocuments({
            createdAt: { 
              $gte: new Date(date.setHours(0, 0, 0, 0)),
              $lt: new Date(date.setHours(23, 59, 59, 999))
            }
          });
          
          ticketsOverTime.push({
            date: date.toISOString().split('T')[0],
            count
          });
        }
        
        // For response and resolution time, in a real app you'd calculate these
        // based on actual ticket update times
        const responseTime = 2.4; // hours (placeholder)
        const resolutionTime = 12.7; // hours (placeholder)
        
        return {
          ticketsByStatus,
          ticketsByPriority,
          ticketsOverTime: ticketsOverTime.reverse(), // Most recent last
          responseTime,
          resolutionTime
        };
      } catch (error) {
        console.error("Error generating admin reports:", error);
        throw new Error("Failed to generate reports");
      }
    }
  },
  
  Mutation: {
    updateUserRole: async (_, { userId, role }, { user }) => {
      // Check if user is admin
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      
      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { role },
          { new: true }
        );
        
        if (!updatedUser) {
          throw new Error("User not found");
        }
        
        return updatedUser;
      } catch (error) {
        console.error("Error updating user role:", error);
        throw new Error("Failed to update user role");
      }
    },
    
    deleteUser: async (_, { userId }, { user }) => {
      // Check if user is admin
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      
      try {
        const result = await User.findByIdAndDelete(userId);
        
        if (!result) {
          throw new Error("User not found");
        }
        
        // You might want to also delete or reassign associated tickets here
        
        return true;
      } catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("Failed to delete user");
      }
    },
    
    assignTicket: async (_, { ticketId, agentId }, { user }) => {
      // Check if user is admin
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      
      try {
        // Verify agent exists if agentId is provided
        if (agentId) {
          const agent = await User.findById(agentId);
          if (!agent) {
            throw new Error("Agent not found");
          }
        }
        
        const updatedTicket = await Ticket.findByIdAndUpdate(
          ticketId,
          { 
            assignedTo: agentId,
            status: "in-progress" // Update status to in-progress when assigned
          },
          { new: true }
        );
        
        if (!updatedTicket) {
          throw new Error("Ticket not found");
        }
        
        return updatedTicket;
      } catch (error) {
        console.error("Error assigning ticket:", error);
        throw new Error("Failed to assign ticket");
      }
    },
    
    createKBArticle: async (_, { title, content, category }, { user }) => {
      // Check if user is admin
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      
      try {
        // Assuming you have a KBArticle model, you would create one here
        // For this example, we'll just return a placeholder
        return {
          id: "kb-" + Math.floor(Math.random() * 1000),
          title,
          content,
          category,
          createdAt: new Date().toISOString()
        };
      } catch (error) {
        console.error("Error creating KB article:", error);
        throw new Error("Failed to create KB article");
      }
    }
  }
};

module.exports = adminResolvers;