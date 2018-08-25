//@flow

import type {
  ValidationContext,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  FieldNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  ArgumentNode,
  NameNode,
  InputValueDefinitionNode,
  IntValueNode,
} from 'graphql';

export type costComplexityOptions = {
  costLimit: number,
  onSuccess?: (depth: number) => void,
  onError?: (actual: number, maxDepth: number) => string,
};

const graphql = require('graphql');

const { GraphQLError } = graphql;

class CostLimitComplexity {
  context: ValidationContext;
  rateLimit: number;
  OperationDefinition: Object;
  argsArray: Array<number>;
  cost: number;
  config: costComplexityOptions;

  constructor(context: ValidationContext, config: costComplexityOptions) {
    this.context = context;

    this.argsArray = [];
    this.cost = 0;
    this.config = config;

    this.OperationDefinition = {
      enter: this.onOperationDefinitionEnter,
      leave: this.onOperationDefinitionLeave,
    };
    this.FragmentDefinition = {
      enter: this.onFragmentDefinitionEnter,
      leave: this.onFragmentDefinitionLeave,
    };
  }

  onOperationDefinitionEnter(operationNode: OperationDefinitionNode) {
    this.calculateCost(operationNode);
  }

  onFragmentDefinitionEnter(operationNode: FragmentDefinitionNode) {
    this.calculateCost(operationNode);
  }

  onFragmentDefinitionLeave(operationNode: FragmentDefinitionNode) {
    console.log('EXIT FRAGMENT DEFINITION NODE');
    return this.validateQuery();
  }

  calculateCost(node: OperationDefinitionNode | FieldNode | FragmentDefinitionNode): void {
    console.log('*** CURRENT NODE \n', node);
    if (node.selectionSet) {
      node.selectionSet.selections.forEach(child => {
        if (child.kind === 'Field') {
          if (this.argsArray.length === 0) {
            this.queryFirstIteration(child);
          } else {
            if (child.arguments && child.arguments.length > 0) {
              this.cost += this.argsArray.reduce((product, num) => {
                return (product *= num);
              }, 1);
              this.updateArgumentArray(false, child);
              this.calculateCost(child);
            } else if (child.arguments && child.arguments.length == 0 && child.selectionSet) {
              this.cost += this.argsArray.reduce((product, num) => {
                return (product *= num);
              }, 1);
              this.updateArgumentArray(true);

              this.calculateCost(child);
            }
          }
        }
      });
    }
    console.log('******THIS COST', this.cost);
  }

  validateQuery(): void | GraphQLError {
    // const { costLimit, onSuccess, onError } = this.config;

    if (this.config.costLimit < this.cost) {
      // console.log('LIMIT', this.config.costLimit, '\nACTUAL COST', this.cost);
      if (typeof this.config.onError === 'function') {
        this.config.onError(this.cost, this.config.costLimit);
      } else {
        throw new GraphQLError(`Actual cost is greater than set cost limit.`);
      }
    } else {
      if (typeof onSuccess === 'function') {
        console.log(onSuccess(this.cost));
      }
    }
  }

  onOperationDefinitionLeave() {
    return this.validateQuery();
  }
}

module.exports = CostLimitComplexity;
