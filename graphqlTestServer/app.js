const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');

const app = express();
<<<<<<< HEAD
const schema = require('./schema/schema.js');
const depthComplexity = require('../dist/depthRule/indexDepth.js');
const costLimit = require('../dist/rateLimitRule/indexCost.js');
=======
const schema = require('./schema/schema');
const depthComplexityWrapper = require('../src/depthRule/indexDepth.js');
const RateLimitWrapper = require('../src/rateLimitRule/indexRate.js');
>>>>>>> 9b00bb7b23d4fb02aac859bc1d58c453c0486c04

mongoose.connect('mongodb://satyam:n5u6n8s9@ds017165.mlab.com:17165/testdb1');
mongoose.connection.once('open', () => {
  console.log('connected with database');
});

<<<<<<< HEAD
const ruleCost = {
  costLimit: 2,
  onSuccess: cost => `Complete, query cost is ${cost}`,
  onError: (cost, costLimit) => `Error: Cost is ${cost} but cost limit is ${costLimit}`,
};
const ruleDepth = {
  depthLimit: 10,
  onSuccess: depth => `Complete, query depth is ${depth}`,
  onError: (depth, maximumDepth) => `Error: Current depth is ${depth} but max depth is ${maximumDepth}`,
};
app.use(
  '/graphql',
  graphqlHTTP(() => ({
    schema,
    graphiql: true,
    validationRules: [depthComplexity(ruleDepth), costLimit(ruleCost)],
  })),
);
=======
app.use('/graphql', graphqlHTTP((req,res,gqlParams)=>({
		schema,
		graphiql: true,
		validationRules:[
			depthComplexityWrapper(10),
			RateLimitWrapper('hello')
		]
	})))
>>>>>>> 9b00bb7b23d4fb02aac859bc1d58c453c0486c04

app.listen(5000, () => {
  console.log('listening to 5000');
});
