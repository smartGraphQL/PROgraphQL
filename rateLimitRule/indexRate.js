const RateLimitComplexity = require('./rateLimit');
const { ValidationContext } = require('graphql');

const RateLimitWrapper = rateLimit => (ValidationContext) => {
  const result = new RateLimitComplexity(ValidationContext, rateLimit);
  return result;
};

module.exports = RateLimitWrapper;
