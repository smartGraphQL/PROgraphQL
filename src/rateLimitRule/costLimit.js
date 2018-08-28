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

    this.fragmentsList = {};
    this.validateQueryOnFragment = true;

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
    // this.calculateCost(operationNode);
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
    if (this.validateQueryOnFragment) this.validateQuery();
  }

  calculateCostVersion1(node, localArgs = [], currentCost = 1) {
    console.log('LOCAL ARGS ', localArgs);
    console.log('CURRENT COSTTT ', currentCost);
    // if(node.kind === 'Field') console.log('field Name ', node.name.value);
    this.cost = Math.max(this.cost, currentCost);

    if (node.selectionSet) {
      const { selections } = node.selectionSet;
      const costArray = new Array(selections.length);

      selections.forEach((childNode, index) => {
        const modifiedLocalArgs = [].concat(localArgs);
        const args = this.getArguments(childNode) || null;
        if (args && (args['first'] || args['last'])) {
          costArray[index] = this.updateCost(currentCost, modifiedLocalArgs);
          this.updateLocalArgsArr(modifiedLocalArgs, args['first'] || args['last']);
        }
        console.log('costArray[index]  ', costArray[index]);
        this.calculateCostVersion1(childNode, modifiedLocalArgs, costArray[index] || currentCost);
      });
    } else if (node.kind === 'FragmentSpread')
      this.fragments[node.name.value] = { currentCost, localArgs };
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
    return (currentCost += array.reduce((product, num) => product * num, 1));
    // return currentCost + product;
  }

  updateLocalArgsArr(arr, argumentValue) {
    arr.push(argumentValue);
  }

  /*
  ** Old calculate cost functions 
  **/

  /*
  updateArgumentArray(addConstant: boolean, node?: FieldNode): void {
    if (addConstant) this.argsArray.push(1);
    else if (typeof node !== 'undefined' && node.arguments) {
      node.arguments.forEach(argNode => {
        if ((argNode.name === 'first' || 'last') && argNode.value.kind === 'IntValue') {
          const argValue = Number(argNode.value.value);
          isNaN(argValue) ? '' : this.argsArray.push(argValue);
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
*/

  validateQuery(): void | GraphQLError {
    const { costLimit, onSuccess, onError } = this.config;

    console.log('COSTT', this.cost);
    if (costLimit < this.cost) {
      this.validateQueryOnFragment = false;
      if (onError) throw new GraphQLError(onError(this.cost, costLimit));
      else
        throw new GraphQLError(
          `The complexity score of current query is ${
            this.cost
          }, max complexity score is currently set to ${costLimit}.`,
        );
    } else if (onSuccess) onSuccess(cost);
  }
}

module.exports = CostLimitComplexity;
