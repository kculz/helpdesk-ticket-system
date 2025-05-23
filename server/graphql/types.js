const { gql } = require("apollo-server-express");

const typeDefs = gql`
  scalar Upload

  type User {
    id: ID!
    workId: String
    fullname: String!
    phone: String!
    email: String!
    dept: String!
    role: String!  # "admin", "technician", or "user" (default: user)
    token: String
    createdAt: String
  }

  type Ticket {
    id: ID!
    userId: ID!
    description: String!
    status: String!
    priority: String!
    category: String!
    requiresTechnician: Boolean!
    createdAt: String!
    assignedTo: User  # Changed from ID to User
    user: User
  }

  type ChatMessage {
    id: ID!
    ticketId: ID!
    sender: String!
    message: String!
    messageType: String!
    voiceUrl: String
    createdAt: String!
  }

  type CallDetails {
    type: String!
    ticketId: ID!
    callId: String!
    participants: [String!]!
    timestamp: String!
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

  type TextToSpeechResponse {
    success: Boolean!
    voiceUrl: String
    error: String
  }

  type TechnicianTicket {
  id: ID!
  description: String!
  status: String!
  priority: String!
  category: String!
  requiresTechnician: Boolean!
  createdAt: String!
  userId: User!
  assignedTo: User
  messages: [ChatMessage!]
}

  type TicketCounts {
    open: Int
    inProgress: Int
    resolved: Int
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
    getAdminReports(period: String): AdminReports
    getRecentUsers(limit: Int = 2): [User!]!
    getAllUsers: [User!]!
    getUserById(id: ID!): User
    
    # Technician Query
    getTechnicianTickets: [TechnicianTicket!]!
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
    createTicket(
      description: String!
      priority: String
      category: String
      requiresTechnician: Boolean 
    ): Ticket
    updateTicketStatus(id: ID!, status: String!): Ticket
    sendMessage(
      ticketId: ID!
      sender: String!
      message: String
      messageType: String
      voiceFile: Upload
    ): ChatMessage
    initiateCall(ticketId: ID!): CallDetails
    convertTextToSpeech(text: String!): TextToSpeechResponse
    
    # Admin Mutations
    updateUserRole(userId: ID!, role: String!): User
    updateUser(
      id: ID!
      fullname: String
      phone: String
      email: String
      dept: String
      role: String
    ): User!
    deleteUser(id: ID!): Boolean!
    assignTicket(ticketId: ID!, agentId: ID!): Ticket
    createKBArticle(title: String!, content: String!, category: String!): KBArticle
  }

  type Subscription {
    messageSent(ticketId: ID!): ChatMessage
    callInitiated(ticketId: ID!): CallDetails
  }
`;

module.exports = typeDefs;