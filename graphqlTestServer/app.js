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

const ruleCost = {
	maximumCapacity: 90,
	onSuccess: (cost) => (`Complete, query cost is ${cost}`),
	onError: (cost, maximumCapacity) => (`Error: Cost is ${cost} but rate limit is ${maximumCapacity}`)
}
const ruleDepth = {
	depthLimit: 10,
	onSuccess: (depth) => (`Complete, query depth is ${depth}`),
	onError: (depth, maximumDepth) => (`Error: Current depth is ${depth} but max depth is ${maximumDepth}`)
}
app.use('/graphql', graphqlHTTP((req,res,gqlParams)=>({
		schema,
		graphiql: true,
		validationRules:[
			depthComplexityWrapper(ruleDepth),
		  RateLimitWrapper(ruleCost)
		]
	})))

app.listen(5000, () => {
	console.log('listening to 5000')
})
