const DepthComplexity = require('./depthComplexity');
<<<<<<< HEAD
const { ValidationContext } = require('graphql');
import type { DepthComplexityOptions } from './depthComplexity';
=======
const {ValidationContext , GraphQLError} = require('graphql');
>>>>>>> 9b00bb7b23d4fb02aac859bc1d58c453c0486c04

const depthComplexity = (rule: DepthComplexityOptions): Function => {
  return (context: ValidationContext): DepthComplexity => {
    let result = new DepthComplexity((context: ValidationContext), (rule: DepthComplexityOptions));
    return result;
  };
};

<<<<<<< HEAD
module.exports = depthComplexity;
=======
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
>>>>>>> 9b00bb7b23d4fb02aac859bc1d58c453c0486c04
