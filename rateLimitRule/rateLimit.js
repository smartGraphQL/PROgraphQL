const graphql = require('graphql');

const { GraphQLError } = graphql;

class RateLimitComplexity {
  constructor(context, rateLimit) {
    this.context = context;
    this.rateLimit = rateLimit;
    this.argsArray = [];
    this.cost = 0;

    this.OperationDefinition = {
      enter: this.onOperationDefinitionEnter,
      leave: this.onOperationDefinitionLeave,
    };
  }

  onOperationDefinitionEnter(operationNode) {
    this.calculateCost(operationNode);
  }

  calculateCost(node) {
    if (node.selectionSet) {
      node.selectionSet.selections.forEach((childNode) => {
        if (this.argsArray.length === 0) {
          this.cost += 1;
          if (childNode.arguments.length !== 0) {
            this.argsArray.push(Number(childNode.arguments[0].value.value));
          } else this.argsArray.push(1);
          this.calculateCost(childNode);
        } else if (childNode.arguments.length > 0) {
          this.cost += this.argsArray.reduce((product, num) => (product *= num), 1);
          this.argsArray.push(Number(childNode.arguments[0].value.value));
          this.calculateCost(childNode);
        } else if (childNode.arguments.length == 0 && childNode.selectionSet) {
          const product = this.argsArray.reduce((product, num) => (product *= num), 1);
          this.cost += product;
          this.argsArray.push(1);
          this.calculateCost(childNode);
        }
        console.log('COST', this.cost);
      });
    }
  }
}

module.exports = RateLimitComplexity;
