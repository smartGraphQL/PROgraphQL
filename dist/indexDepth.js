'use strict';

var DepthComplexity = require('./depthComplexity');

var _require = require('graphql'),
    GraphQLError = _require.GraphQLError;

var depthComplexity = function depthComplexity(rule) {
  if (rule.depthLimit <= 0) throw new GraphQLError('Depth limit must be greater than 0');

  return function (context) {
    return new DepthComplexity(context, rule);
  };
};

module.exports = depthComplexity;