const DepthComplexity = require('./depthComplexity');
const {ValidationContext} = require('graphql');
import type {DepthComplexityOptions} from "./depthComplexity";

const depthComplexity = (rule: DepthComplexityOptions): Function => {
	return (context: ValidationContext): DepthComplexity => {
		let result = new DepthComplexity(context: ValidationContext, rule: DepthComplexityOptions);
		return result;
	}
}

module.exports = depthComplexity;
