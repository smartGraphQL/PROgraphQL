const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const schema = require('./schema/schema');

const app = express();
<<<<<<< HEAD
const depthComplexityWrapper = require('./depthRule/indexDepth.js');
const RateLimitWrapper = require('./rateLimitRule/indexRate.js');
// const bodyParser = require('body-parser');

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
      RateLimitWrapper(100),
    ],
  })),
);
=======
const depthComplexityWrapper = require('.././depthRule/indexDepth.js');
const RateLimitWrapper = require('.././rateLimitRule/indexRate.js');
//const bodyParser = require('body-parser');

mongoose.connect("mongodb://satyam:n5u6n8s9@ds017165.mlab.com:17165/testdb1");
mongoose.connection.once('open', ()=>{
	console.log('connected with database')
})

app.use('/graphql', graphqlHTTP((req,res,gqlParams)=>({
		schema,
		graphiql: true,
		validationRules:[
			//depthComplexityWrapper(10),
			RateLimitWrapper(100)
		]
	})))
>>>>>>> ee561cdf8fb6c0234571f31fa4e4dcecb878fb98

app.listen(5000, () => {
  console.log('listening to 5000');
});
