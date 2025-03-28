import { gql } from '@apollo/client';

// Subscribe to new messages
export const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription MessageSent($ticketId: ID!) {
    messageSent(ticketId: $ticketId) {
      id
      sender
      message
      createdAt
    }
  }
`;

// Subscribe to call initiations
export const CALL_INITIATED_SUBSCRIPTION = gql`
  subscription CallInitiated($ticketId: ID!) {
    callInitiated(ticketId: $ticketId) {
      callId
      participants
      timestamp
    }
  }
`;