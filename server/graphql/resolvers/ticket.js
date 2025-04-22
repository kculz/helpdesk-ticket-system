const Ticket = require("../../models/Ticket");
const User = require("../../models/User")
const emailQueue = require("../../workers/emailWorker");

const ticketResolvers = {
  Query: {
    getAllTickets: async () => {
      return await Ticket.find();
    },
    getUserTickets: async (_, __, context) => {
      if (!context.user) throw new Error("Unauthorized: Please log in");
      return await Ticket.find({ userId: context.user.id });
    },
    getTicket: async (_, { id }) => {
      const ticket = await Ticket.findById(id);
      if (!ticket) throw new Error("Ticket not found");
      return ticket;
    },
    getTicketCounts: async (_, __, context) => {
      if (!context.user) throw new Error("Unauthorized: Please log in.");

      const open = await Ticket.countDocuments({ userId: context.user.id, status: "open" });
      const inProgress = await Ticket.countDocuments({ userId: context.user.id, status: "in-progress" });
      const resolved = await Ticket.countDocuments({ userId: context.user.id, status: "resolved" });

      return { open, inProgress, resolved };
    },
    getRecentTickets: async (_, __, context) => {
      if (!context.user) throw new Error("Unauthorized: Please log in.");

      const tickets = await Ticket.find({ userId: context.user.id })
        .sort({ createdAt: -1 }) // Sort by most recent
        .limit(5); // Limit to 5 recent tickets

      return tickets;
    },

  },
  Mutation: {
    createTicket: async (_, { description, priority, category, requiresTechnician }, { user: currentUser }) => {
      if (!currentUser) throw new Error("Unauthorized: Please log in");
    
      // Validate input
      if (!description || description.length < 20) {
        throw new Error("Description must be at least 20 characters long");
      }
    
      let assignedTechnician = null;
      if (category === "technical") {
        assignedTechnician = await User.aggregate([
          { $match: { role: "technician" } },
          {
            $lookup: {
              from: "tickets",
              let: { technicianId: "$_id" },
              pipeline: [
                { 
                  $match: { 
                    $expr: { 
                      $and: [
                        { $eq: ["$assignedTo", "$$technicianId"] },
                        { $in: ["$status", ["open", "in-progress"]] }
                      ]
                    }
                  }
                },
                { $count: "openTickets" }
              ],
              as: "tickets"
            }
          },
          { $addFields: { openTickets: { $ifNull: [{ $arrayElemAt: ["$tickets.openTickets", 0] }, 0] } } },
          { $sort: { openTickets: 1 } },
          { $limit: 1 }
        ]);
    
        if (assignedTechnician.length === 0) {
          throw new Error("No available technicians at the moment. Please try again later.");
        }
      }
    
      const ticket = new Ticket({
        userId: currentUser.id,
        description,
        status: "open",
        priority: priority || "medium",
        category,
        assignedTo: assignedTechnician?.[0]?._id || null,
        requiresTechnician: requiresTechnician || false,
        createdAt: new Date().toISOString(),
      });
    
      await ticket.save();
      
      // Populate and send notification
      const populatedTicket = await Ticket.findById(ticket._id)
        .populate('assignedTo', 'fullname email dept')
        .populate('userId', 'fullname email')
        .exec();
    
      if (category === 'technical' && populatedTicket.assignedTo?.email) {
        try {
          await emailQueue.add({
            email: populatedTicket.assignedTo.email,
            subject: `New ${priority} Priority Ticket Assigned`,
            template: 'technician-assignment',
            context: {
              technicianName: populatedTicket.assignedTo.fullname,
              ticketId: ticket._id,
              priority: priority,
              description: description,
              requesterName: populatedTicket.userId.fullname,
              requesterEmail: populatedTicket.userId.email,
              assignmentTime: new Date().toLocaleString()
            }
          });
        } catch (error) {
          console.error("Failed to queue notification:", error);
        }
      }
    
      return populatedTicket;
    },


    updateTicketStatus: async (_, { id, status }, { user: currentUser }) => {
      if (!currentUser) throw new Error("Unauthorized: Please log in");
      try {
        const updatedTicket = await Ticket.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        );
        return updatedTicket;
      } catch (error) {
        console.error("Error updating ticket status:", error);
        throw new Error("Failed to update ticket status");
      }
    },
  },
};

module.exports = ticketResolvers;