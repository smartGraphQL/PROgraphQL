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
		key: 'calculateCost',
		value: function calculateCost(node) {
			var _this = this;

			var iteration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

			// console.log('iteration ', iteration);
			if (node.selectionSet) {
				node.selectionSet.selections.forEach(function (childNode) {
					if (_this.argsArray.length === 0) {
						_this.cost += 1;
						if (childNode.arguments.length == 0) {
							_this.argsArray.push(1);
						} else {
							_this.argsArray.push(Number(childNode.arguments[0].value.value));
						}
						_this.calculateCost(childNode, iteration += 1);
					} else {
						if (childNode.arguments && childNode.arguments.length > 0) {
							_this.cost += _this.argsArray.reduce(function (product, num) {
								return product *= num;
							}, 1);
							_this.argsArray.push(Number(childNode.arguments[0].value.value));
							_this.calculateCost(childNode, iteration += 1);
						} else if (childNode.arguments && childNode.arguments.length == 0 && childNode.selectionSet) {
							_this.cost += _this.argsArray.reduce(function (product, num) {
								return product *= num;
							}, 1);
							_this.argsArray.push(1);
							_this.calculateCost(childNode, iteration += 1);
						}
					}
				});
			}
			// console.log("COST", this.cost);
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
					console.log(onError(this.cost, costLimit));
					throw new GraphQLError('You are asking for ' + this.cost + ' records. This is ' + (this.cost - this.costLimit) + ' greater than the permitted request');
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