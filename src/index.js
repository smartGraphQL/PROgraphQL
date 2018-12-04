const { GraphQLError } = require('graphql');

const DepthComplexity = require('./depthComplexity');
const CostComplexityOptions = require('./costLimit');

const depthComplexity = (rule) => {
  if (rule.depthLimit <= 0) throw new GraphQLError('Depth limit must be greater than 0');

  return context => new DepthComplexity(context, rule);
};

const costLimit = (rule) => {
  if (rule.costLimit <= 0) throw new GraphQLError('Cost limit must be greater than 0');

  return context => new CostComplexityOptions(context, rule);
};

module.exports = {
  depthComplexity,
  costLimit,
};
