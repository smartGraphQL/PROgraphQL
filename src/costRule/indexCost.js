//@flow

const CostComplexityOptions = require('./costLimit');
const { GraphQLError } = require('graphql');

import type { ValidationContext } from 'graphql';
import type { costComplexityOptions } from './costLimit';

const costLimit = (rule: costComplexityOptions): Function => {
  if (rule.costLimit <= 0) throw new GraphQLError('Cost limit must be greater than 0');

  return (context: ValidationContext): CostComplexityOptions => {
    return new CostComplexityOptions((context: ValidationContext), (rule: costComplexityOptions));
  };
};

module.exports = costLimit;