//@flow

const { GraphQLError } = require('graphql');

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

  onOperationDefinitionLeave() {
    this.validateQuery();
  }

  onFragmentDefinitionEnter(operationNode: FragmentDefinitionNode) {
    this.calculateCost(operationNode);
  }

  onFragmentDefinitionLeave() {
    this.validateQuery();
  }

  /**
   * is this function necessary?
   */

  // updateArgument(node: ArgumentNode): void {
  //   console.log(node.kind);
  // }

  updateArgumentArray(addConstant: boolean, node?: FieldNode): void {
    if (addConstant) this.argsArray.push(1);
    else if (typeof node !== 'undefined' && node.arguments) {
      node.arguments.forEach(argNode => {
        if (argNode.name === 'first' || 'last') {
          if (argNode.value.kind === 'IntValue') {
            let argValue = Number(argNode.value.value);
            isNaN(argValue) ? '' : this.argsArray.push(argValue);
          }
        }
      });
    }
  }

  queryFirstIteration(node: FieldNode): void {
    this.cost += 1;

    if (node.arguments) this.updateArgumentArray(false, node);
    else this.updateArgumentArray(true);

    this.calculateCost(node);
  }

  calculateCost(
    node:
      | OperationDefinitionNode
      | FieldNode
      | FragmentSpreadNode
      | InlineFragmentNode
      | FragmentDefinitionNode,
  ): void {
    if (node.kind === 'FragmentSpread') return;
    if (node.selectionSet) {
      node.selectionSet.selections.forEach(child => {
        if (child.kind === 'Field') {
          if (this.argsArray.length === 0) this.queryFirstIteration(child);
          else if (child.arguments && child.arguments.length > 0) {
            this.cost += this.argsArray.reduce((product, num) => product * num, 1);

            this.updateArgumentArray(false, child);
            this.calculateCost(child);
          } else if (child.arguments && child.arguments.length == 0 && child.selectionSet) {
            this.cost += this.argsArray.reduce((product, num) => product * num, 1);

            this.updateArgumentArray(true);
            this.calculateCost(child);
          }
        }
      });
    }
  }

  validateQuery(): void | GraphQLError {
    const { costLimit, onSuccess, onError } = this.config;
    const { cost } = this;

    if (costLimit < cost) {
      if (onError) throw new GraphQLError(onError(cost, costLimit));
      else
        throw new GraphQLError(
          `The complexity score of current query is ${cost}, max complexity score is currently set to ${costLimit}.`,
        );
    } else if (onSuccess) onSuccess(cost);
  }
}

module.exports = CostLimitComplexity;
