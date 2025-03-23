require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const mongoose = require("mongoose");
const authMiddleware = require("./middlewares/authMiddleware");

// Import GraphQL schema and resolvers
const typeDefs = require("./graphql/types");
const resolvers = require("./graphql/resolvers");

const app = express();
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=> {
    console.log("db connected")
}).catch((error) => {
  console.log(`db connection error: ${error}`)
})


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Attach user from authMiddleware to context
    const user = authMiddleware(req);
    return { req, user };
  },
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
  
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}${server.graphqlPath}`);
  });
}

startServer();
