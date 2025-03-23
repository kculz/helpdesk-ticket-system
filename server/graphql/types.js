const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    workId: String
    fullname: String!
    phone: String!
    email: String!
    dept: String!
    role: String!  # "admin" or "user" (default: user)
    token: String
    createdAt: String
  }

  type Ticket {
    id: ID!
    userId: ID!
    description: String!
    status: String!
    priority: String!
    createdAt: String!
    assignedTo: ID
    user: User
  }

  type ChatMessage {
    id: ID!
    ticketId: ID!
    sender: String!
    message: String!
    createdAt: String!
  }
  
  type AdminDashboardData {
    totalUsers: Int!
    totalTickets: Int!
    openTickets: Int!
    resolvedTickets: Int!
    agentsOnline: Int!
  }
  
  type StatusCount {
    status: String!
    count: Int!
  }
  
  type PriorityCount {
    priority: String!
    count: Int!
  }
  
  type TimeSeriesData {
    date: String!
    count: Int!
  }
  
  type AdminReports {
    ticketsByStatus: [StatusCount!]!
    ticketsByPriority: [PriorityCount!]!
    ticketsOverTime: [TimeSeriesData!]!
    responseTime: Float!
    resolutionTime: Float!
  }
  
  type KBArticle {
    id: ID!
    title: String!
    content: String!
    category: String!
    createdAt: String!
  }

  type Query {
    getAllTickets: [Ticket] # Public
    getUserTickets: [Ticket!] # Private
    getChatMessages(ticketId: ID!): [ChatMessage]
    getTicket(id: ID!): Ticket
    getUserProfile: User
    getTicketCounts: TicketCounts
    getRecentTickets: [Ticket]
    
    # Admin Queries
    getAdminDashboardData: AdminDashboardData
    getAllUsers: [User!]!
    getAdminReports(period: String): AdminReports
  }

  type TicketCounts {
    open: Int
    inProgress: Int
    resolved: Int
  }

  type Mutation {
    sendOtp(email: String!): Boolean
    verifyOtp(email: String!, otp: String!): User
    registerUser(
      workId: String
      fullname: String!
      phone: String!
      email: String!
      dept: String!
      role: String!
    ): User
    createTicket(description: String!, priority: String): Ticket
    updateTicketStatus(id: ID!, status: String!): Ticket
    sendMessage(ticketId: ID!, sender: String!, message: String!): ChatMessage
    
    # Admin Mutations
    updateUserRole(userId: ID!, role: String!): User
    deleteUser(userId: ID!): Boolean
    assignTicket(ticketId: ID!, agentId: ID!): Ticket
    createKBArticle(title: String!, content: String!, category: String!): KBArticle
  }
`;

module.exports = typeDefs;