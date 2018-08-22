//@flow
import type {
	ValidationContext,
	FragmentDefinitionNode,
	OperationDefinitionNode,
	FieldNode,
	FragmentSpreadNode,
	InlineFragmentNode
} from 'graphql';

export type rateComplexityOptions = {
	maximumComplexity: number,
	onSuccess ?: (depth:number)=>void,
	onError ?:(actual:number,maxDepth:number)=>GraphQLError
}

const graphql = require('graphql');
const {
	GraphQLError,
} = graphql;


class RateLimitComplexity{
	context:ValidationContext;
	rateLimit:number;
	OperationDefinition: Object;
	argsArray: Array<number>;
	cost:number;

	constructor(context:ValidationContext, rule:RateLimitOptions){
		this.context = context;
		this.rateLimit = rule.maximumCapacity;
		this.argsArray = [];
		this.cost = 0;
		this.rule = rule;

		this.OperationDefinition = {
			enter:this.onOperationDefinitionEnter,
			leave:this.onOperationDefinitionLeave
		}
	}


	onOperationDefinitionEnter(operationNode:OperationDefinitionNode){
		this.calculateCost(operationNode:OperationDefinitionNode)
	}

	calculateCost(node :OperationDefinitionNode|FieldNode, iteration=0):void{
		// console.log('iteration ', iteration);
		if(node.selectionSet){
			node.selectionSet.selections.forEach(childNode => {
				if(this.argsArray.length === 0){
					this.cost += 1;
					if(childNode.arguments.length == 0){
						this.argsArray.push(1);
					}else{
						this.argsArray.push(Number(childNode.arguments[0].value.value) );
					}
					this.calculateCost(childNode, iteration+=1);
				} else {
					if(childNode.arguments.length > 0){
						this.cost += this.argsArray.reduce((product, num) => {
						return product*=num;
						},1);
						this.argsArray.push(Number(childNode.arguments[0].value.value));
						this.calculateCost(childNode,iteration+=1);
					}else if(childNode.arguments.length == 0 &&childNode.selectionSet){
						this.cost += this.argsArray.reduce((product, num) => {
								return product*=num;
							},1);
						this.argsArray.push(1);
						this.calculateCost(childNode,iteration+=1);
						}
				}

			})
		}
		console.log("COST", this.cost);
	}

	onOperationDefinitionLeave(){
		if(this.cost > this.rateLimit){
			if(typeof this.rule.onError === 'function'){
				console.log(this.rule.onError(this.cost, this.rateLimit));
				throw new GraphQLError(this.rule.onError(this.cost, this.rateLimit));
			} else {
				console.log(this.rule.onError(this.cost, this.rateLimit));
				throw new GraphQLError(`You are asking for ${this.cost} records. This is ${this.cost-this.rateLimit} greater than the permitted request`)
			}
		} else {
			if(typeof this.rule.onSuccess === 'function'){
				console.log(this.rule.onSuccess(this.cost));
			}
		}
	}
}

module.exports = RateLimitComplexity;
