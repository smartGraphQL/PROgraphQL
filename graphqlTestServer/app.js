const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const app = express();
const schema =  require('./schema/schema.js');
const depthComplexityWrapper = require('../src/depthRule/indexDepth.js');
const RateLimitWrapper = require('../src/rateLimitRule/indexRate.js');
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
			RateLimitWrapper(1)
		]
	})))

app.listen(5000, () => {
	console.log('listening to 5000')
})
