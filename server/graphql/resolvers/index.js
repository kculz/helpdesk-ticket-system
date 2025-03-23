const { merge } = require("lodash");
const authResolvers = require("./auth");
const userResolvers = require("./user");
const ticketResolvers = require("./ticket");  // Your existing ticket resolvers
const chatResolvers = require("./chat");        // Your existing chat resolvers

const resolvers = merge(authResolvers, userResolvers, ticketResolvers, chatResolvers);

module.exports = resolvers;
