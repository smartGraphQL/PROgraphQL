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
  }

  onOperationDefinitionEnter(operationNode: OperationDefinitionNode) {
    this.calculateCost(operationNode);
  }

  calculateCost(node: OperationDefinitionNode | FieldNode): void {
    // console.log('iteration ', iteration);
    console.log(node.selectionSet);
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
  }

  validateQuery(): void | GraphQLError {
    // const { costLimit, onSuccess, onError } = this.config;

    if (this.config.costLimit < this.cost) {
      console.log('LIMIT', this.config.costLimit, '\nACTUAL COST', this.cost);
      if (typeof onError === 'function')
        throw new GraphQLError('ERRORSROS IS FUNCTION CONDITOINAL');
      else {
        console.log('ERRROROSRO');
        // console.log(this.config.onError(this.cost, this.config.costLimit));
        throw new GraphQLError(
          `Actual cost is greater than set cost limit.`,
          // `You are asking for ${this.cost} records. This is ${this.cost -
          //   costLimit} greater than the permitted request`,
        );
      }
    } else if (typeof this.config.onSuccess === 'function') {
      console.log(this.config.onSuccess(this.cost));
    }
  }

  onOperationDefinitionLeave() {
    // console.log(this.config);
    return this.validateQuery();
  }
}

module.exports = CostLimitComplexity;
