const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const schema = require('./schema/schema');

const app = express();
const depthComplexityWrapper = require('../depthRule/indexDepth.js');
const RateLimitWrapper = require('../rateLimitRule/indexRate.js');

mongoose.connect('mongodb://satyam:n5u6n8s9@ds017165.mlab.com:17165/testdb1');
mongoose.connection.once('open', () => {
  console.log('connected with database');
});

app.use(
  '/graphql',
  graphqlHTTP((req, res, gqlParams) => ({
    schema,
    graphiql: true,
    validationRules: [
      // depthComplexityWrapper(10),
      RateLimitWrapper(2),
    ],
  })),
);

app.listen(5001, () => {
  console.log('listening to 5000');
});
