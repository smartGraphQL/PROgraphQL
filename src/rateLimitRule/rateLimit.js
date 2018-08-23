const graphql = require('graphql');

const {
	GraphQLError,
} = graphql;

class RateLimitComplexity{
	constructor(context, rateLimit){
		this.context = context;
		this.rateLimit = rateLimit;
		this.argsArray = [];
		this.cost = 0;

		this.OperationDefinition = {
			enter:this.onOperationDefinitionEnter,
			leave:this.onOperationDefinitionLeave
		}
		this.FragmentDefinition = {
			enter:this.onFragmentDefinitionEnter,
			leave:this.onFragmentDefinitionLeave
		}
	}

	onOperationDefinitionEnter(operationNode){
		//console.log("NODE", operationNode)
		this.calculateCost(operationNode)
	}

	onFragmentDefinitionEnter(fragment){
		//console.log('FRAGGMENTT ENTER',fragment);
		let isFragment = true;
		this.calculateCost(fragment);

	}

	onFragmentDefinitionLeave(){
		//console.log('FRAGGMENTT EXIT');
	}

	calculateCost(node, isFragment){
		// console.log('******* CURRENT NODE', node)
		if(node.selectionSet){
			node.selectionSet.selections.forEach(childNode => {
				console.log(this.argsArray.length)
				if(this.argsArray.length === 0){
					this.cost += 1;
					if(childNode.arguments.length == 0){
						this.argsArray.push(1);
					}
					 else {
						this.argsArray.push(Number(childNode.arguments[0].value.value) );
					}
					this.calculateCost(childNode);
				} else {
					if(childNode.arguments && childNode.arguments.length > 0){
						this.cost += this.argsArray.reduce((product, num) => {
						return product*=num;
						},1);
						this.argsArray.push(Number(childNode.arguments[0].value.value));
						this.calculateCost(childNode);
					}else if(childNode.arguments && childNode.arguments.length == 0 &&childNode.selectionSet){
						this.cost += this.argsArray.reduce((product, num) => {
								return product*=num;
							},1);
						this.argsArray.push(1);
						this.calculateCost(childNode);
						}
				}
				console.log("COST", this.cost);
				return this.cost;
			})
		}
	}

	onOperationDefinitionLeave(){
		if(this.cost > this.rateLimit){
			throw new GraphQLError(`The score of your query is ${this.cost}. Maximum score permitted is ${this.rateLimit}. Please modify your query.`)
		}
	}
}

module.exports = RateLimitComplexity;
