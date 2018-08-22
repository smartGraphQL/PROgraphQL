const graphql = require('graphql');

const {
	GraphQLError,
} = graphql;

class DepthComplexity{

	constructor(validationContext, depth){
		this.context = validationContext;
		this.maxOperationDefinitionDepth = 0;
		this.maxfragmentDefinitionDepth = 0;
		this.maxDepth = 0;
		this.clientMax = depth;
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
		//console.log('FRAGGMENTT EXIT');
	}
	onOperationDefinitionEnter(operationNode){
			//console.log('Entered the OperationDefinition', operationNode);
			// console.log("HELLO",this.context.getSchema());
			this.countDepth(operationNode);
	}

	countDepth(node,depth=0, isFragment,nodeArray=[]){
		//console.log('COUNTTT DEPTH ',node.name.value.toUpperCase() , 'depth ', depth);
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
		console.log('MAXX DEPTHH ', this.maxDepth  );
	}


	onOperationDefinitionLeave(){
		if(this.clientMax < this.maxDepth){
			// console.log('query is tooo nested'.toUpperCase())
			throw new GraphQLError(
				`Query is to complex, MAX DEPTH is ${this.clientMax}, Current DEPTH is ${this.maxDepth}`
			);
		}
		// console.log('Exited the Rule')
	}
}

module.exports = DepthComplexity;
