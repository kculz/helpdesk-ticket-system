import { ApolloClient, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client'; // ✅ use this for file uploads

const createApolloClient = (token) => {
  const uploadLink = createUploadLink({
    uri: `http://localhost:3000/graphql`, // ✅ Same URI, just now supports file uploads
  });

  const authLink = setContext((operation, { headers }) => {
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

  const wsLink = new GraphQLWsLink(createClient({
    url: `ws://localhost:3000/graphql`,
    connectionParams: () => ({
      authorization: token ? `Bearer ${token}` : "",
    }),
    shouldRetry: () => true,
  }));

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    authLink.concat(uploadLink) // ✅ use uploadLink instead of httpLink
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
