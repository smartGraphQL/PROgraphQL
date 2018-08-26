'use strict';

var DepthComplexity = require('./depthComplexity');

var _require = require('graphql'),
    ValidationContext = _require.ValidationContext,
    GraphQLError = _require.GraphQLError;

var depthComplexity = function depthComplexity(rule) {
  if (rule.depthLimit <= 0) throw new GraphQLError('Depth limit must be greater than 0');

  return function (context) {
    var result = new DepthComplexity(context, rule);
    return result;
  };
};

module.exports = depthComplexity;