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
    this.config = config;
    this.cost = 0;

    this.argsArray = [];
    this.fragmentsList = {};

    this.validateOnFragment = true;

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
    this.calculateCostVersion1(operationNode);
  }

  onOperationDefinitionLeave() {
    this.validateQuery();
  }

  onFragmentDefinitionEnter(fragment: FragmentDefinitionNode) {
    const fragName = fragment.name.value;

    if (this.fragmentsList[fragName]) {
      const { currentCost, localArgs } = this.fragmentsList[fragName];
      this.calculateCostVersion1(fragment, localArgs, currentCost);
    }
  }

  onFragmentDefinitionLeave() {
    if (this.validateOnFragment) this.validateQuery();
  }

  calculateCostVersion1(node, localArgs = [], currentCost = 1) {
    this.cost = Math.max(this.cost, currentCost);
    if (node.selectionSet) {
      const { selections } = node.selectionSet;
      const costArray = new Array(selections.length);

      selections.forEach((childNode, index) => {
        const modifiedLocalArgs = [].concat(localArgs);
        const args = this.getArguments(childNode);
        if (args && (args['first'] || args['last'])) {
          costArray[index] = this.updateCost(currentCost, modifiedLocalArgs);
          this.updateLocalArgsArr(modifiedLocalArgs, args['first'] || args['last']);
        }
        this.calculateCostVersion1(childNode, modifiedLocalArgs, costArray[index] || currentCost);
      });
    } else if (node.kind === 'FragmentSpread')
      this.fragmentsList[node.name.value] = { currentCost, localArgs };
  }

  getArguments(node) {
    if (node.arguments) {
      const argObj = {};
      node.arguments.forEach(nodeArg => (argObj[nodeArg.name.value] = nodeArg.value.value));
      return argObj;
    }
    return false;
  }

  updateCost(currentCost, array) {
    if(array.length > 0) {
      return (currentCost += array.reduce((product, num) => product * num, 1));
    }
  }

  updateLocalArgsArr(arr, argumentValue) {
    arr.push(argumentValue);
  }

  validateQuery(): void | GraphQLError {
    const { costLimit, onSuccess, onError } = this.config;

    if (costLimit < this.cost) {
      this.validateQueryOnFragment = false;
      if (onError) throw new GraphQLError(onError(this.cost, costLimit));
      else
        throw new GraphQLError(
          `The complexity score of current query is ${
            this.cost
          }, max complexity score is currently set to ${costLimit}.`,
        );
    } else if (onSuccess) console.log(onSuccess(this.cost));
  }
}

module.exports = CostLimitComplexity;
