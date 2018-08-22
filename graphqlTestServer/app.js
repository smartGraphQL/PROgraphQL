const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const app = express();
<<<<<<< HEAD
const schema = require('./schema/schema');
const depthComplexityWrapper = require('../src/depthRule/indexDepth.js');
const RateLimitWrapper = require('../src/rateLimitRule/indexRate.js');
=======
const schema =  require('./schema/schema.js');
const depthComplexity = require('../dist/depthRule/indexDepth.js');
const costLimit = require('../dist/rateLimitRule/indexCost.js');

>>>>>>> eb6057d08953b14976e9d299646753358c287d95
//const bodyParser = require('body-parser');

mongoose.connect("mongodb://satyam:n5u6n8s9@ds017165.mlab.com:17165/testdb1");
mongoose.connection.once('open', ()=>{
	console.log('connected with database')
});

const ruleCost = {
	costLimit: 2,
	onSuccess: (cost) => (`Complete, query cost is ${cost}`),
	onError: (cost, costLimit) => (`Error: Cost is ${cost} but cost limit is ${costLimit}`)
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
<<<<<<< HEAD
			// depthComplexityWrapper(10),
			RateLimitWrapper(6)
=======
			depthComplexity(ruleDepth),
		  costLimit(ruleCost)
>>>>>>> eb6057d08953b14976e9d299646753358c287d95
		]
	})))

app.listen(5000, () => {
	console.log('listening to 5000')
})
