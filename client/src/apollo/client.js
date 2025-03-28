import { ApolloClient, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const createApolloClient = (token) => {
  const httpLink = createHttpLink({
    uri: `http://localhost:3000/graphql`, // Your HTTP endpoint
  });

  const authLink = setContext((operation, { headers }) => {
    // Public operations that don't require auth
    const publicOperations = ['sendOtp', 'verifyOtp'];
    const isPublicOperation = publicOperations.includes(operation.operationName);

    if (isPublicOperation) {
      return { headers };
    }

    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  // WebSocket link for subscriptions
  const wsLink = new GraphQLWsLink(createClient({
    url: `ws://localhost:3000/graphql`, // Your WebSocket endpoint
    connectionParams: () => ({
      authorization: token ? `Bearer ${token}` : "",
    }),
    shouldRetry: () => true, // Auto-reconnect
  }));

  // Split links based on operation type
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    authLink.concat(httpLink) // Chain auth with HTTP
  );

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
};

export default createApolloClient;