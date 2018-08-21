const DepthComplexity = require('./depthComplexity');
const {ValidationContext} = require('graphql');


const depthComplexityWrapper = (depth) =>{
	return (ValidationContext) => {
		let result = new DepthComplexity(ValidationContext, depth);
		console.log(result);
		return result;
	}
}

module.exports = depthComplexityWrapper;
