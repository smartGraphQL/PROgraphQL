const RateLimitComplexity = require('./rateLimit');
const {ValidationContext, GraphQLError} = require('graphql');

const RateLimitWrapper = (rateLimit) =>{
	if(rateLimit === 0 || rateLimit < 0) {
		throw new GraphQLError('Rate limit must be greater than 0');
	}
	return (ValidationContext) => {
		let result = new RateLimitComplexity(ValidationContext, rateLimit);
		return result;
	}
}

module.exports = RateLimitWrapper;