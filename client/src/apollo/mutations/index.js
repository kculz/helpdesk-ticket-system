import { gql } from "@apollo/client";


// Mutation to send OTP
export const SEND_OTP = gql`
  mutation SendOtp($email: String!) {
    sendOtp(email: $email)
  }
`;

// Mutation to verify OTP
export const VERIFY_OTP = gql`
  mutation VerifyOtp($email: String!, $otp: String!) {
    verifyOtp(email: $email, otp: $otp) {
      id
      email
      role
      token
    }
  }
`;


export const CREATE_TICKET = gql`
  mutation CreateTicket($description: String!, $priority: String) {
    createTicket(description: $description, priority: $priority) {
      id
      description
      status
      priority
      createdAt
    }
  }
`;


export const UPDATE_TICKET_STATUS = gql`
  mutation UpdateTicketStatus($id: ID!, $status: String!) {
    updateTicketStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage(
    $ticketId: ID!
    $sender: String!
    $message: String
    $messageType: String
    $voiceFile: Upload
  ) {
    sendMessage(
      ticketId: $ticketId
      sender: $sender
      message: $message
      messageType: $messageType
      voiceFile: $voiceFile
    ) {
      id
      sender
      message
      messageType
      voiceUrl
      createdAt
    }
  }
`;


// Initiate call for high priority ticket
export const INITIATE_CALL = gql`
  mutation InitiateCall($ticketId: ID!) {
    initiateCall(ticketId: $ticketId) {
      type
      ticketId
      callId
      participants
      timestamp
    }
  }
`;

// Text-to-speech conversion mutation
export const CONVERT_TEXT_TO_SPEECH = gql`
  mutation ConvertTextToSpeech($text: String!) {
    convertTextToSpeech(text: $text) {
      success
      voiceUrl
      error
    }
  }
`;


// Update User Role
export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: String!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      fullname
      role
    }
  }
`;

// Delete User
export const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;

// Assign Ticket
export const ASSIGN_TICKET = gql`
  mutation AssignTicket($ticketId: ID!, $agentId: ID!) {
    assignTicket(ticketId: $ticketId, agentId: $agentId) {
      id
      status
      assignedTo
    }
  }
`;

// Create Knowledge Base Article
export const CREATE_KB_ARTICLE = gql`
  mutation CreateKBArticle($title: String!, $content: String!, $category: String!) {
    createKBArticle(title: $title, content: $content, category: $category) {
      id
      title
      content
      category
      createdAt
    }
  }
`;