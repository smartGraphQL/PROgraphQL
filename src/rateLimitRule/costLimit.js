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

  constructor(context: ValidationContext, config: RateLimitOptions) {
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
    this.calculateCost((operationNode: OperationDefinitionNode));
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
					if(childNode.arguments && childNode.arguments.length > 0){
						this.cost += this.argsArray.reduce((product, num) => {
						return product*=num;
						},1);
						this.argsArray.push(Number(childNode.arguments[0].value.value));
						this.calculateCost(childNode,iteration+=1);
					}else if(childNode.arguments && childNode.arguments.length == 0 &&childNode.selectionSet){
						this.cost += this.argsArray.reduce((product, num) => {
								return product*=num;
							},1);
						this.argsArray.push(1);
						this.calculateCost(childNode,iteration+=1);
						}
				}

          this.calculateCost(childNode);
        } else if (childNode.arguments.length > 0) {
          this.cost += this.argsArray.reduce((product, num) => product * num, 1);
          this.argsArray.push(Number(childNode.arguments[0].value.value));
          this.calculateCost(childNode);
        } else if (childNode.arguments.length == 0 && childNode.selectionSet) {
          this.cost += this.argsArray.reduce((product, num) => product * num, 1);
          this.argsArray.push(1);
          this.calculateCost(childNode, (iteration += 1));
        }
      });
    }
    // console.log("COST", this.cost);
  }

  validateQuery(): void | GraphQLError {
    let { costLimit, onSuccess, onError } = this.config;

    if (costLimit < this.cost) {
      if (typeof onError === 'function') {
        throw new GraphQLError(onError(this.cost, costLimit));
      } else {
        console.log(onError(this.cost, costLimit));
        throw new GraphQLError(
          `You are asking for ${this.cost} records. This is ${this.cost -
            this.costLimit} greater than the permitted request`,
        );
      }
    } else if (typeof onSuccess === 'function') {
      console.log(onSuccess(this.cost));
    }
  }

  onOperationDefinitionLeave() {
    this.validateQuery();
  }
}

module.exports = CostLimitComplexity;
