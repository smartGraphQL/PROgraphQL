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

		this.fragments = {};
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
		let name = fragment.name.value;
		if(this.fragments[name]){
			let currentCost = this.fragments[name].currentCost;
			let localArgs = this.fragments[name].localArgs;
			this.calculateCostVersion1(fragment,localArgs,currentCost);
		}

  }

  onFragmentDefinitionLeave() {
		if(this.validateQueryOnFragment){
			 this.validateQuery();
		}

  }



	calculateCostVersion1(node,localArgs=[],currentCost=1){
		console.log('LOCAL ARGS ', localArgs);
		console.log('CURRENT COSTTT ' , currentCost);
		// if(node.kind === 'Field') console.log('field Name ', node.name.value);
    this.cost = Math.max(this.cost, currentCost);

		if(node.selectionSet){
				let costArray = new Array(node.selectionSet.selections.length);
			// nodeArray = nodeArray.concat(node.selectionSet.selections);
		  node.selectionSet.selections.forEach((childNode, index)=>{
			 let	modifiedLocalArgs = [].concat(localArgs);
				console.log()
				if(childNode.arguments && childNode.arguments.length > 0){


						console.log(`ARGUMENTS name ${childNode.arguments[0].name.value} value ${childNode.arguments[0].value.value}`);

						let product =  localArgs.reduce((product, num) => product * num, 1);

						costArray[index]  = currentCost + product;
						console.log(`costArrayyy ${costArray[index]} index ${index}`);
						console.log('PRODUCTTT' , product);
						modifiedLocalArgs.push(Number(childNode.arguments[0].value.value));
					}
				this.calculateCostVersion1(childNode,modifiedLocalArgs,(costArray[index]||currentCost));
		});
		}else {
			// console.log('Reached leaf nodeee',node.kind);
			console.log('IAM DONE')
			if(node.kind === 'FragmentSpread'){
				this.fragments[node.name.value] = {currentCost, localArgs};
			}
			return;
		}

	}

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

  validateQuery(): void | GraphQLError {
    const { costLimit, onSuccess, onError } = this.config;
    const { cost } = this;
		console.log(`COSTTT ` , cost);
    if (costLimit < cost) {
			this.validateQueryOnFragment = false;
      if (onError) throw new GraphQLError(onError(cost, costLimit));
      else
        throw new GraphQLError(
          `The complexity score of current query is ${cost}, max complexity score is currently set to ${costLimit}.`,
        );
    } else if (onSuccess) onSuccess(cost);
  }
}

module.exports = CostLimitComplexity;
