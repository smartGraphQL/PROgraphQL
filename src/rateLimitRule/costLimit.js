//@flow

import type {
  ValidationContext,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  FieldNode,
  FragmentSpreadNode,
  InlineFragmentNode,
} from 'graphql';

export type costComplexityOptions = {
  costLimit: number,
  onSuccess?: (depth: number) => void,
  onError?: (actual: number, maxDepth: number) => GraphQLError,
};

const graphql = require('graphql');
const { GraphQLError } = graphql;

class CostLimitComplexity {
  context: ValidationContext;
  rateLimit: number;
  OperationDefinition: Object;
  argsArray: Array<number>;
  cost: number;

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
      node.selectionSet.selections.forEach(childNode => {
        if (this.argsArray.length === 0) {
          this.cost += 1;

          if (childNode.arguments.length == 0) this.argsArray.push(1);
          else this.argsArray.push(Number(childNode.arguments[0].value.value));

          this.calculateCost(childNode);
        } else if (childNode.arguments && childNode.arguments.length > 0) {
          this.cost += this.argsArray.reduce((product, num) => product * num, 1);
          this.argsArray.push(Number(childNode.arguments[0].value.value));
          this.calculateCost(childNode);
        } else if (
          childNode.arguments &&
          childNode.arguments.length == 0 &&
          childNode.selectionSet
        ) {
          this.cost += this.argsArray.reduce((product, num) => product * num, 1);
          this.argsArray.push(1);
          this.calculateCost(childNode);
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
      }
      else {
        throw new GraphQLError(
          `Actual cost is greater than set cost limit.`
        );
      }
    } else if (typeof this.config.onSuccess === 'function') {
      console.log(this.config.onSuccess(this.cost));
    }
  }

  onOperationDefinitionLeave() {
    return this.validateQuery();
  }

 
}

module.exports = CostLimitComplexity;
