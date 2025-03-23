const Ticket = require("../../models/Ticket");

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
    createTicket: async (_, { description, priority }, { user: currentUser }) => {
      if (!currentUser) throw new Error("Unauthorized: Please log in");

      const ticket = new Ticket({
        userId: currentUser.id,
        description,
        status: "open",
        priority: priority || "medium",
        createdAt: new Date().toISOString(),
      });
      await ticket.save();
      return ticket;
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