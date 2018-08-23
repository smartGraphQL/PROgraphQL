const graphql = require('graphql');

import type {
  ValidationContext,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  FieldNode,
  FragmentSpreadNode,
  InlineFragmentNode,
} from 'graphql';

const { GraphQLError } = graphql;

export type DepthComplexityOptions = {
  depthLimit: number,
  onSuccess?: (depth: number) => void,
  onError?: (depth: number, depthLimit: number) => GraphQLError,
};

class DepthComplexity {
  context: ValidationContext;
  depthLimit: number;
  OperationDefinition: Object;
  OperationDefinition: {
    enter: Function,
    leave: Function,
  };
  FragmentDefinition: {
    enter: Function,
    leave: Function,
  };
  config: DepthLimitOptions;
  maxDepth: number;

  constructor(context: ValidationContext, config: DepthComplexityOptions) {
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
    let isFragment = true;
    this.calculateDepth(fragment, -1, isFragment);
  }

  onOperationDefinitionEnter(operationNode) {
    this.calculateDepth(operationNode);
  }

  calculateDepth(
    node: FieldNode | OperationDefinitionNode,
    depth: number = 0,
    isFragment: boolean,
    nodeArray: Array<
      | FragmentDefinitionNode
      | OperationDefinitionNode
      | FieldNode
      | FragmentSpreadNode
      | InlineFragmentNode,
    > = [],
  ) {
    if (!node.selectionSet) {
      return;
    } else {
      nodeArray = nodeArray.concat(node.selectionSet.selections);
      depth += 1;
      nodeArray.forEach(childNode => {
        if (isFragment) {
          this.calculateDepth(childNode, depth, isFragment);
        } else {
          this.calculateDepth(childNode, depth);
        }
      });
    }

    if (isFragment) {
      this.fragmentDefinitionDepth = Math.max(this.fragmentDefinitionDepth, depth);
      this.actualDepth = this.operationDefinitionDepth + this.fragmentDefinitionDepth;
    } else {
      this.operationDefinitionDepth = Math.max(this.operationDefinitionDepth, depth);
      this.actualDepth = this.operationDefinitionDepth;
    }
  }

  validateQuery(): void {
    let { depthLimit, onSuccess, onError } = this.config;
    if (depthLimit < this.actualDepth) {
      if (typeof onError === 'function')
        throw new GraphQLError(onError(this.actualDepth, this.clientMax));
      else
        throw new GraphQLError(
          `Query is to complex, MAX DEPTH is ${this.clientMax}, Current DEPTH is ${
            this.actualDepth
          }`,
        );
    } else if (typeof onSuccess === 'function') {
      console.log(onSuccess(this.actualDepth));
    }
  }
  onOperationDefinitionLeave(): GraphQLError | void {
    this.validateQuery();
  }

  onFragmentDefinitionLeave() {
    this.validateQuery();
  }
}

module.exports = DepthComplexity;
