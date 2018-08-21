const DepthComplexity = require('./depthComplexity');
const { ValidationContext } = require('graphql');

const depthComplexityWrapper = depth => (ValidationContext) => {
  const result = new DepthComplexity(ValidationContext, depth);
  console.log(result);
  return result;
};

module.exports = depthComplexityWrapper;
