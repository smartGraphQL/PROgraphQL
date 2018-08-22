const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const app = express();
const schema =  require('./schema/schema.js');
const depthComplexityWrapper = require('../dist/depthRule/indexDepth.js');
const RateLimitWrapper = require('../dist/rateLimitRule/indexRate.js');

//const bodyParser = require('body-parser');

mongoose.connect("mongodb://satyam:n5u6n8s9@ds017165.mlab.com:17165/testdb1");
mongoose.connection.once('open', ()=>{
	console.log('connected with database')
})

const rule = {
	maximumCapacity: 20,
	// onSuccess: (cost) => void,
	// onComplete:(cost, maximumCapacity)=>void
}
app.use('/graphql', graphqlHTTP((req,res,gqlParams)=>({
		schema,
		graphiql: true,
		validationRules:[
			//depthComplexityWrapper(10),
			RateLimitWrapper(rule)
		]
	})))

app.listen(5000, () => {
	console.log('listening to 5000')
})
