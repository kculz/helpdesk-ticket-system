import { gql } from "@apollo/client";


export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    getUserProfile {
      id
      workId
      fullname
      phone
      email
      dept
      role
    }
  }
`;

export const GET_USER_TICKETS = gql`
  query GetUserTickets {
    getUserTickets {
      id
      description
      status
      priority
      createdAt
    }
  }
`;


export const GET_TICKET = gql`
  query GetTicket($id: ID!) {
    getTicket(id: $id) {
      id
      userId
      description
      status
      priority
      createdAt
    }
  }
`;


export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($ticketId: ID!) {
    getChatMessages(ticketId: $ticketId) {
      id
      sender
      message
      messageType
      voiceUrl
      createdAt
    }
  }
`;

// Query to get ticket counts by status
export const GET_TICKET_COUNTS = gql`
  query GetTicketCounts {
    getTicketCounts {
      open
      inProgress
      resolved
    }
  }
`;

// Query to get recent tickets
export const GET_RECENT_TICKETS = gql`
  query GetRecentTickets {
    getRecentTickets {
      id
      description
      status
      priority
      createdAt
    }
  }
`;


// Admin Dashboard Data
export const GET_ADMIN_DASHBOARD_DATA = gql`
  query GetAdminDashboardData {
    getAdminDashboardData {
      totalUsers
      totalTickets
      openTickets
      resolvedTickets
      agentsOnline
    }
  }
`;

// Get All Users (for admin user management)
export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      workId
      fullname
      email
      phone
      dept
      role
      createdAt
    }
  }
`;

// Get All Tickets (for admin ticket management)
export const GET_ALL_TICKETS = gql`
  query GetAllTickets {
    getAllTickets {
      id
      userId
      description
      status
      priority
      createdAt
      user {
        fullname
        email
      }
    }
  }
`;

// Get Admin Reports Data
export const GET_ADMIN_REPORTS = gql`
  query GetAdminReports($period: String) {
    getAdminReports(period: $period) {
      ticketsByStatus {
        status
        count
      }
      ticketsByPriority {
        priority
        count
      }
      ticketsOverTime {
        date
        count
      }
      responseTime
      resolutionTime
    }
  }
`;