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
  mutation CreateTicket(
    $description: String!
    $priority: String
    $category: String!
    $requiresTechnician: Boolean!
  ) {
    createTicket(
      description: $description
      priority: $priority
      category: $category
      requiresTechnician: $requiresTechnician
    ) {
      id
      description
      status
      priority
      category
      requiresTechnician
      assignedTo {
        id
        fullname
        email
        dept
      }
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
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
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

export const REGISTER_USER = gql`
  mutation RegisterUser(
    $fullname: String!
    $phone: String!
    $email: String!
    $dept: String!
    $role: String!
  ) {
    registerUser(
      fullname: $fullname
      phone: $phone
      email: $email
      dept: $dept
      role: $role
    ) {
      id
      workId
      fullname
      email
      role
    }
  }
`;


export const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $fullname: String
    $phone: String
    $email: String
    $dept: String
    $role: String
  ) {
    updateUser(
      id: $id
      fullname: $fullname
      phone: $phone
      email: $email
      dept: $dept
      role: $role
    ) {
      id
      fullname
      email
      role
    }
  }
`;