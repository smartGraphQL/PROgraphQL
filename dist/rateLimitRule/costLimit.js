'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var graphql = require('graphql');

var GraphQLError = graphql.GraphQLError;

var CostLimitComplexity = function () {
	function CostLimitComplexity(context, config) {
		_classCallCheck(this, CostLimitComplexity);

		this.context = context;

		this.argsArray = [];
		this.cost = 0;
		this.config = config;

		this.OperationDefinition = {
			enter: this.onOperationDefinitionEnter,
			leave: this.onOperationDefinitionLeave
		};
	}

	_createClass(CostLimitComplexity, [{
		key: 'onOperationDefinitionEnter',
		value: function onOperationDefinitionEnter(operationNode) {
			this.calculateCost(operationNode);
		}
	}, {
		key: 'updateArgument',
		value: function updateArgument(node) {
			console.log(node.kind);
		}
	}, {
		key: 'updateArgumentArray',
		value: function updateArgumentArray(addConstant, node) {
			var _this = this;

			if (addConstant) {
				this.argsArray.push(1);
				return;
			}
			if (typeof node !== 'undefined' && node.arguments) {
				node.arguments.forEach(function (argNode) {
					if (argNode.name === 'first' || 'last') {
						if (argNode.value.kind === 'IntValue') {
							var argValue = Number(argNode.value.value);
							isNaN(argValue) ? '' : _this.argsArray.push(argValue);
						}
					}
				});
			}
		}
	}, {
		key: 'queryFirstIteration',
		value: function queryFirstIteration(node) {
			this.cost += 1;
			if (node.arguments) this.updateArgumentArray(false, node);else this.updateArgumentArray(true);
			this.calculateCost(node);
		}
	}, {
		key: 'calculateCost',
		value: function calculateCost(node) {
			var _this2 = this;

			if (node.kind === 'FragmentSpread') return;
			if (node.selectionSet) {
				node.selectionSet.selections.forEach(function (child) {
					if (child.kind === 'Field') {
						if (_this2.argsArray.length === 0) {
							_this2.queryFirstIteration(child);
						} else {
							if (child.arguments && child.arguments.length > 0) {
								_this2.cost += _this2.argsArray.reduce(function (product, num) {
									return product *= num;
								}, 1);
								_this2.updateArgumentArray(false, child);
								_this2.calculateCost(child);
							} else if (child.arguments && child.arguments.length == 0 && child.selectionSet) {
								_this2.cost += _this2.argsArray.reduce(function (product, num) {
									return product *= num;
								}, 1);
								_this2.updateArgumentArray(true);

								_this2.calculateCost(child);
							}
						}
					}
				});
			}
		}
	}, {
		key: 'validateQuery',
		value: function validateQuery() {
			var _config = this.config,
			    costLimit = _config.costLimit,
			    onSuccess = _config.onSuccess,
			    onError = _config.onError;


			if (costLimit < this.cost) {
				if (typeof onError === 'function') {
					// console.log('sjdksd' + onError(this.cost, costLimit));
					throw new GraphQLError(onError(this.cost, costLimit));
				} else {
					// console.log(onError(this.cost, costLimit));
					throw new GraphQLError('You are asking for ' + this.cost + ' records. This is ' + (this.cost - costLimit) + ' greater than the permitted request');
				}
			} else {
				if (typeof onSuccess === 'function') {
					console.log(onSuccess(this.cost));
				}
			}
		}
	}, {
		key: 'onOperationDefinitionLeave',
		value: function onOperationDefinitionLeave() {
			this.validateQuery();
		}
	}]);

	return CostLimitComplexity;
}();

module.exports = CostLimitComplexity;