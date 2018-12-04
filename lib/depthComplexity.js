const { GraphQLError } = require('graphql');

class DepthComplexity {
  constructor(context, config) {
    this.context = context;
    this.operationDefinitionDepth = 0;
    this.fragmentDefinitionDepth = 0;
    this.actualDepth = 0;
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

  onFragmentDefinitionEnter(fragment) {
    const isFragment = true;
    this.calculateDepth(fragment, -1, isFragment);
  }

  onOperationDefinitionEnter(operationNode) {
    this.calculateDepth(operationNode, 0, false);
  }

  onOperationDefinitionLeave() {
    this.validateQuery();
  }

  onFragmentDefinitionLeave() {
    this.validateQuery();
  }

  calculateDepth(node, depth = 0, isFragment, nodeArray = []) {
    if (!node.selectionSet) return;

    nodeArray = nodeArray.concat(node.selectionSet.selections);
    depth += 1;
    nodeArray.forEach((childNode) => {
      if (isFragment) this.calculateDepth(childNode, depth, isFragment);
      else this.calculateDepth(childNode, depth, false);
    });


    if (isFragment) {
      this.fragmentDefinitionDepth = Math.max(this.fragmentDefinitionDepth, depth);
      this.actualDepth = this.operationDefinitionDepth + this.fragmentDefinitionDepth;
    } else {
      this.operationDefinitionDepth = Math.max(this.operationDefinitionDepth, depth);
      this.actualDepth = this.operationDefinitionDepth;
    }
  }

  validateQuery() {
    const { depthLimit, onSuccess, onError } = this.config;

    if (depthLimit < this.actualDepth) {
      if (onError) throw new GraphQLError(onError(this.actualDepth, depthLimit));
      else {
        throw new GraphQLError(
          `Current query depth of ${this.actualDepth} exceeds set depth limit of ${depthLimit}`,
        );
      }
    } else if (onSuccess) onSuccess(this.actualDepth);
  }
}

module.exports = DepthComplexity;
