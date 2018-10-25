//@flow

const DepthComplexity = require('./depthComplexity');
const { GraphQLError } = require('graphql');

import type { ValidationContext } from 'graphql';
import type { DepthComplexityOptions } from './depthComplexity';

const depthComplexity = (rule: DepthComplexityOptions): Function => {
  if (rule.depthLimit <= 0) throw new GraphQLError('Depth limit must be greater than 0');

  return (context: ValidationContext): DepthComplexity => {
    return new DepthComplexity((context: ValidationContext), (rule: DepthComplexityOptions));
  };
};

module.exports = depthComplexity;
