'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var graphql = require('graphql');
var GraphQLError = graphql.GraphQLError;

var RateLimitComplexity = function () {
	function RateLimitComplexity(context, rule) {
		_classCallCheck(this, RateLimitComplexity);

		this.context = context;
		this.rateLimit = rule.maximumCapacity;
		this.argsArray = [];
		this.cost = 0;
		this.rule = rule;

		this.OperationDefinition = {
			enter: this.onOperationDefinitionEnter,
			leave: this.onOperationDefinitionLeave
		};
	}

	_createClass(RateLimitComplexity, [{
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
						if (childNode.arguments.length > 0) {
							_this.cost += _this.argsArray.reduce(function (product, num) {
								return product *= num;
							}, 1);
							_this.argsArray.push(Number(childNode.arguments[0].value.value));
							_this.calculateCost(childNode, iteration += 1);
						} else if (childNode.arguments.length == 0 && childNode.selectionSet) {
							_this.cost += _this.argsArray.reduce(function (product, num) {
								return product *= num;
							}, 1);
							_this.argsArray.push(1);
							_this.calculateCost(childNode, iteration += 1);
						}
					}
				});
			}
			console.log("COST", this.cost);
		}
	}, {
		key: 'onOperationDefinitionLeave',
		value: function onOperationDefinitionLeave() {
			console.log('(this.cost > this.rateLimit ' + (this.cost > this.rateLimit) + ' this.cost ' + this.cost + ' this.rateLimit ' + this.rateLimit);
			if (this.cost > this.rateLimit) {
				if (typeof this.rule.onError === 'function') {
					console.log(this.rule.onError(this.cost, this.rateLimit));
					throw new GraphQLError(this.rule.onError(this.cost, this.rateLimit));
				} else {
					console.log(this.rule.onError(this.cost, this.rateLimit));
					throw new GraphQLError('You are asking for ' + this.cost + ' records. This is ' + (this.cost - this.rateLimit) + ' greater than the permitted request');
				}
			} else {
				if (typeof this.rule.onSuccess === 'function') {
					console.log(this.rule.onSuccess(this.cost));
				}
			}
		}
	}]);

	return RateLimitComplexity;
}();

module.exports = RateLimitComplexity;