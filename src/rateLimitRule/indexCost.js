const CostComplexityOptions = require('./costLimit');
import type { ValidationContext } from 'graphql';
import type { costComplexityOptions } from './costLimit';
const { GraphQLError } = require('graphql');

//@flow
const costLimit = (rule: costComplexityOptions): Function => {
  if (rule.costLimit <= 0) {
    throw new GraphQLError('Cost limit must be greater than 0');
  }
  return (context: ValidationContext): CostComplexityOptions => {
    let result = new CostComplexityOptions(
      (context: ValidationContext),
      (rule: costComplexityOptions),
    );
    return result;
  };
};

module.exports = costLimit;
