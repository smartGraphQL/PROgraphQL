const DepthComplexity = require('./depthComplexity');
const {ValidationContext} = require('graphql');
import type {DepthComplexityOptions} from "./depthComplexity";

<<<<<<< HEAD

const depthComplexityWrapper = (depth) =>{
	return (ValidationContext) => {
		let result = new DepthComplexity(ValidationContext, depth);
=======
const depthComplexity = (rule: DepthComplexityOptions): Function => {
	return (context: ValidationContext): DepthComplexity => {
		let result = new DepthComplexity(context: ValidationContext, rule: DepthComplexityOptions);
>>>>>>> eb6057d08953b14976e9d299646753358c287d95
		return result;
	}
}

module.exports = depthComplexity;
