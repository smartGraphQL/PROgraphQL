const RateLimitComplexity = require('./rateLimit');
const {ValidationContext} = require('graphql');

const RateLimitWrapper = (rateLimit) =>{
	return (ValidationContext) => {
		let result = new RateLimitComplexity(ValidationContext, rateLimit);
		return result;
	}
}

module.exports = RateLimitWrapper;