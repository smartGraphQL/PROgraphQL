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
    return this.validateQuery();
  }

  updateArgument(node:ArgumentNode):void{
		console.log(node.kind);
	}


	updateArgumentArray(addConstant:boolean,node?:FieldNode):void{
		if(addConstant) {
				this.argsArray.push(1);
				return;
		}
		if(typeof node !== 'undefined' && node.arguments){
			node.arguments.forEach(argNode=>{
					if(argNode.name === 'first' || 'last'){
							if(argNode.value.kind === 'IntValue'){
								let argValue = Number(argNode.value.value);
								isNaN(argValue)? '' : this.argsArray.push(argValue);
							}
					}
			});
		}
	}


	queryFirstIteration(node:FieldNode):void{
		this.cost += 1;
		if(node.arguments) this.updateArgumentArray(false,node);
		else this.updateArgumentArray(true)
		this.calculateCost(node);
  }
  
  calculateCost(node:(OperationDefinitionNode|FieldNode|FragmentSpreadNode|InlineFragmentNode|FragmentDefinitionNode)):void{
		if(node.kind === 'FragmentSpread') return;
		if(node.selectionSet){
			node.selectionSet.selections.forEach(child => {
				if(child.kind === ('Field') ){
					if(this.argsArray.length === 0){
						this.queryFirstIteration(child);
					} else {
						if(child.arguments && child.arguments.length > 0){
							this.cost += this.argsArray.reduce((product, num) => {
								return product*=num;
							},1);
							this.updateArgumentArray(false,child);
							this.calculateCost(child);
						}else if(child.arguments && child.arguments.length == 0 && child.selectionSet){
							this.cost += this.argsArray.reduce((product, num) => {
									return product*=num;
								},1);
							this.updateArgumentArray(true);

							this.calculateCost(child);
						}
					}
				}
			})
		}
	}

  validateQuery():void|GraphQLError{
		let {costLimit, onSuccess, onError} = this.config;

		if(costLimit < this.cost){
			if(typeof onError === 'function'){
				throw new GraphQLError(onError(this.cost, costLimit));
			} else {
				throw new GraphQLError(`You are asking for ${this.cost} records. This is ${this.cost-costLimit} greater than the permitted request`)
			}
		} else {
			if(typeof onSuccess === 'function'){
				console.log(onSuccess(this.cost));
			}
		}
	}

  onOperationDefinitionLeave() {
    return this.validateQuery();
  }
}

module.exports = CostLimitComplexity;