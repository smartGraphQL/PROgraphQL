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
	}

	onOperationDefinitionEnter(operationNode){
		//console.log("NODE", operationNode)
		this.calculateCost(operationNode)
	}

	calculateCost(node, iteration=0){
		console.log('iteration ', iteration);
		if(node.selectionSet){
			console.log("NODEEE has selectionSET")
			node.selectionSet.selections.forEach(childNode => {
				
				if(this.argsArray.length === 0){
					// console.log("childNOde", childNode);
					this.cost += 1;
					this.argsArray.push(Number(childNode.arguments[0].value.value) || 1);
					console.log("COST", this.cost);
					console.log("argsArray ",this.argsArray)
					this.calculateCost(childNode, iteration+=1);
				} else {
					console.log("childNOde", childNode);
					if(childNode.arguments.length > 0){
						console.log('Argumentss Exist');
						this.cost += this.argsArray.reduce((product, num) => {
						return product*=num; 
						},1); 
						this.argsArray.push(Number(childNode.arguments[0].value.value));
					console.log("COST", this.cost);
					console.log("argsArray ",this.argsArray)
					this.calculateCost(childNode,iteration+=1);
					}else if(childNode.arguments.length == 0 &&childNode.selectionSet){
						console.log('NO arguments, but SelectionSET exists')
					let product = this.argsArray.reduce((product, num) => {
							return product*=num; 
						},1); 
					this.cost += product; 
					this.argsArray.push(1);
					console.log("COST/product", this.cost, product);
					console.log("argsArray ",this.argsArray)
					this.calculateCost(childNode,iteration+=1);
					}
				}
				console.log("COST", this.cost);
				//console.log("args", this.argsArray);
			})
		} 
	}
}

module.exports = RateLimitComplexity;