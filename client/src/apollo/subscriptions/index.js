import { gql } from '@apollo/client';

export const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription MessageSent($ticketId: ID!) {
    messageSent(ticketId: $ticketId) {
      id
      sender
      message
      messageType
      voiceUrl
      createdAt
    }
  }
`;

export const CALL_INITIATED_SUBSCRIPTION = gql`
  subscription CallInitiated($ticketId: ID!) {
    callInitiated(ticketId: $ticketId) {
      type
      ticketId
      callId
      participants
      timestamp
    }
  }
`;