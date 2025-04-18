require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const mongoose = require("mongoose");
const authMiddleware = require("./middlewares/authMiddleware");

// Import GraphQL schema and resolvers
const typeDefs = require("./graphql/types");
const resolvers = require("./graphql/resolvers");
const { graphqlUploadExpress } = require("graphql-upload");

const app = express();

// Apply middleware in the correct order
app.use(cors());
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("DB connected successfully");
}).catch((error) => {
  console.log(`DB connection error: ${error}`);
});



const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const user = authMiddleware(req);
    return { req, user };
  },
  uploads: false
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
  
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error("Failed to start server:", error);
});