const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const { GraphQLError } = require('graphql');

const app = express();
const schema = require('./schema/schema.js');
const depthComplexity = require('../dist/depthRule/indexDepth.js');
const costLimit = require('../dist/rateLimitRule/indexCost.js');

mongoose.connect('mongodb://satyam:n5u6n8s9@ds017165.mlab.com:17165/testdb1');
mongoose.connection.once('open', () => {
  console.log('connected with database');
});

const ruleCost = {
  costLimit: 5,
  onSuccess: cost => `Complete, query cost is ${cost}`,
  onError: (cost, setCostLimit) => {
    throw new GraphQLError(`Current cost is ${cost} but max cost is ${setCostLimit}`);
  },
};
const ruleDepth = {
  depthLimit: 15,
  onSuccess: depth => `Complete, query depth is ${depth}`,
  onError: (depth, maximumDepth) => {
    throw new GraphQLError(`Current depth is ${depth} but max depth is ${maximumDepth}`);
  },
};
app.use(
  '/graphql',
  graphqlHTTP(() => ({
    schema,
    graphiql: true,
    validationRules: [depthComplexity(ruleDepth), costLimit(ruleCost)],
  })),
);

app.listen(5000, () => {
  console.log('listening to 5000');
});
