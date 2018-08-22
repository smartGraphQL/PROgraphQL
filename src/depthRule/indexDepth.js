const DepthComplexity = require('./depthComplexity');
const {ValidationContext , GraphQLError} = require('graphql');


const depthComplexityWrapper = (depth) =>{
	if(depth <= 0) {
		throw new GraphQLError('Depth limit must be greater than 0');
	}
	return (ValidationContext) => {
		let result = new DepthComplexity(ValidationContext, depth);
		return result;
	}
}

module.exports = depthComplexityWrapper;
