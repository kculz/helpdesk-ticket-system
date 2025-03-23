import React, { useMemo } from 'react';
import { ApolloProvider } from '@apollo/client';
import { useGetToken } from '../utils/useToken';
import createApolloClient from './client';

const ApolloWrapper = ({ children }) => {
  const token = useGetToken(); // Retrieve the token from Redux

  console.log('Token: ++++++++++++++++', token);

  // Create the Apollo Client instance with the token
  const client = useMemo(() => createApolloClient(token), [token]);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
};

export default ApolloWrapper;