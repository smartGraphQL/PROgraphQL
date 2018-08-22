'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var graphql = require('graphql');

var GraphQLError = graphql.GraphQLError;

var DepthComplexity = function () {
	function DepthComplexity(validationContext, depth) {
		_classCallCheck(this, DepthComplexity);

		this.context = validationContext;
		this.maxOperationDefinitionDepth = 0;
		this.maxfragmentDefinitionDepth = 0;
		this.maxDepth = 0;
		this.clientMax = depth;
		this.OperationDefinition = {
			enter: this.onOperationDefinitionEnter,
			leave: this.onOperationDefinitionLeave
		};

		this.FragmentDefinition = {
			enter: this.onFragmentDefinitionEnter,
			leave: this.onFragmentDefinitionLeave
		};
	}

	_createClass(DepthComplexity, [{
		key: 'onFragmentDefinitionEnter',
		value: function onFragmentDefinitionEnter(fragment) {
			//console.log('FRAGGMENTT ENTER',fragment);
			var isFragment = true;
			this.countDepth(fragment, -1, isFragment);
		}
	}, {
		key: 'onFragmentDefinitionLeave',
		value: function onFragmentDefinitionLeave() {
			//console.log('FRAGGMENTT EXIT');
		}
	}, {
		key: 'onOperationDefinitionEnter',
		value: function onOperationDefinitionEnter(operationNode) {
			//console.log('Entered the OperationDefinition', operationNode);
			console.log("HELLO", this.context.getSchema());
			this.countDepth(operationNode);
		}
	}, {
		key: 'countDepth',
		value: function countDepth(node) {
			var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

			var _this = this;

			var isFragment = arguments[2];
			var nodeArray = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

			//console.log('COUNTTT DEPTH ',node.name.value.toUpperCase() , 'depth ', depth);
			if (!node.selectionSet) {
				return;
			} else {
				nodeArray = nodeArray.concat(node.selectionSet.selections);
				depth += 1;
				nodeArray.forEach(function (childNode) {
					//console.log('FOREACH method ', depth)
					if (isFragment) {
						_this.countDepth(childNode, depth, isFragment);
					} else {
						_this.countDepth(childNode, depth);
					}
				});
			}

			if (isFragment) {
				// console.log('ISFRAGMENT ',this.maxfragmentDefinitionDepth , 'depthh ', depth);
				this.maxfragmentDefinitionDepth = Math.max(this.maxfragmentDefinitionDepth, depth);
				this.maxDepth = this.maxOperationDefinitionDepth + this.maxfragmentDefinitionDepth;
				//console.log('ISFRAGMENT ',this.maxfragmentDefinitionDepth);
			} else {
				this.maxOperationDefinitionDepth = Math.max(this.maxOperationDefinitionDepth, depth);
				this.maxDepth = this.maxOperationDefinitionDepth;
			}
			//console.log('MAXX DEPTHH ', this.maxDepth  );
		}
	}, {
		key: 'onOperationDefinitionLeave',
		value: function onOperationDefinitionLeave() {
			if (this.clientMax < this.maxDepth) {
				console.log('query is tooo nested'.toUpperCase());
				throw new GraphQLError('Query is to complex, MAX DEPTH is ' + this.clientMax + ', Current DEPTH is ' + this.maxDepth);
			}
			console.log('Exited the Rule');
		}
	}]);

	return DepthComplexity;
}();

module.exports = DepthComplexity;