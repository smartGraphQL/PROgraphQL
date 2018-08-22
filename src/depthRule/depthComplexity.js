const graphql = require('graphql');

import type {
	ValidationContext,
	FragmentDefinitionNode,
	OperationDefinitionNode,
	FieldNode,
	FragmentSpreadNode,
	InlineFragmentNode
} from 'graphql';

const {
	GraphQLError,
} = graphql;

export type DepthComplexityOptions = {
	maxDepth: number,
	onSuccess ?: (depth:number)=>void,
	onError ?:(depth:number,maxDepth:number)=>GraphQLError
}

class DepthComplexity {
	context:ValidationContext;
	depthLimit:number;
	OperationDefinition: Object;
	maxDepth:number;

	constructor(context: ValidationContext, rule: DepthLimitOptions){
		this.context = context;
		this.maxOperationDefinitionDepth = 0;
		this.maxfragmentDefinitionDepth = 0;
		this.maxDepth = 0;
		this.rule = rule;
		this.clientMax = rule.maximumDepth;
		this.OperationDefinition = {
			enter:this.onOperationDefinitionEnter,
			leave:this.onOperationDefinitionLeave
		};

		this.FragmentDefinition = {
			enter:this.onFragmentDefinitionEnter,
			leave:this.onFragmentDefinitionLeave
		}
	}

	onFragmentDefinitionEnter(fragment){
		//console.log('FRAGGMENTT ENTER',fragment);
		let isFragment = true;
		this.countDepth(fragment,-1,isFragment);

	}

	onFragmentDefinitionLeave(){
	}

	onOperationDefinitionEnter(operationNode){
			this.countDepth(operationNode);
	}

	countDepth(node: FieldNode | OperationDefinitionNode, depth=0 , isFragment, nodeArray=[]){
		if(!node.selectionSet){
			return ;
		} else{
			nodeArray = nodeArray.concat( node.selectionSet.selections);
			depth +=1;
			nodeArray.forEach(childNode=>{
				  //console.log('FOREACH method ', depth)
				if(isFragment){
					this.countDepth(childNode,depth,isFragment);
				}else{
					this.countDepth(childNode,depth);
				}
			})
		}

		if(isFragment){
			// console.log('ISFRAGMENT ',this.maxfragmentDefinitionDepth , 'depthh ', depth);
			this.maxfragmentDefinitionDepth = Math.max(this.maxfragmentDefinitionDepth,depth);
			this.maxDepth = this.maxOperationDefinitionDepth + this.maxfragmentDefinitionDepth;
			//console.log('ISFRAGMENT ',this.maxfragmentDefinitionDepth);
		}else{
			this.maxOperationDefinitionDepth = Math.max(this.maxOperationDefinitionDepth,depth);
			this.maxDepth = this.maxOperationDefinitionDepth;
		}
		//console.log('MAXX DEPTHH ', this.maxDepth  );
	}


	onOperationDefinitionLeave(){
		if(this.clientMax < this.maxDepth){
			if(typeof this.rule.onError === 'function'){
				console.log('query is tooo nested'.toUpperCase())
				throw new GraphQLError(this.rule.onError(this.maxDepth, this.clientMax));
			} else {
				console.log('query is tooo nested'.toUpperCase())
				throw new GraphQLError(
					`Query is to complex, MAX DEPTH is ${this.clientMax}, Current DEPTH is ${this.maxDepth}`
				);
			}
		} else {
			 if(typeof this.rule.onSuccess === 'function'){
				 console.log(this.rule.onSuccess(this.maxDepth));
			 }
		}
	}
}

module.exports = DepthComplexity;
