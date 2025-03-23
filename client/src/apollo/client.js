import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const createApolloClient = (token) => {
  const httpLink = createHttpLink({
    uri: `http://localhost:3000/graphql`, // Replace with your GraphQL endpoint
  });

  const authLink = setContext((operation, { headers }) => {
    // List of operations that don't require the Authorization header
    const publicOperations = ['sendOtp', 'verifyOtp'];

    // Check if the current operation is public
    const isPublicOperation = publicOperations.includes(operation.operationName);

    // If the operation is public, don't include the Authorization header
    if (isPublicOperation) {
      return { headers };
    }

    // For private operations, include the Authorization header
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink), // Combine the authLink and httpLink
    cache: new InMemoryCache(),
  });
};

export default createApolloClient;