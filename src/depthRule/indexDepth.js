const DepthComplexity = require('./depthComplexity');
const {ValidationContext} = require('graphql');


const depthComplexityWrapper = (depth) =>{
	return (ValidationContext) => {
		let result = new DepthComplexity(ValidationContext, depth);
		return result;
	}
}

module.exports = depthComplexityWrapper;
