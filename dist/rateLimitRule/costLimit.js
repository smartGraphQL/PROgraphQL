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

      // console.log('iteration ', iteration);
      if (node.selectionSet) {
        node.selectionSet.selections.forEach(function (childNode) {
          if (_this.argsArray.length === 0) {
            _this.cost += 1;

            if (childNode.arguments.length == 0) _this.argsArray.push(1);else _this.argsArray.push(Number(childNode.arguments[0].value.value));

            _this.calculateCost(childNode);
          } else if (childNode.arguments && childNode.arguments.length > 0) {
            _this.cost += _this.argsArray.reduce(function (product, num) {
              return product * num;
            }, 1);
            _this.argsArray.push(Number(childNode.arguments[0].value.value));
            _this.calculateCost(childNode, iteration += 1);
          } else if (childNode.arguments && childNode.arguments.length == 0 && childNode.selectionSet) {
            _this.cost += _this.argsArray.reduce(function (product, num) {
              return product * num;
            }, 1);
            _this.argsArray.push(1);
            _this.calculateCost(childNode);
          }
        });
      }
    }
  }, {
    key: 'validateQuery',
    value: function validateQuery() {
      // let { costLimit, onSuccess, onError } = this.config;

      if (costLimit < this.cost) {
        if (typeof onError === 'function') {
          throw new GraphQLError(this.onError(this.cost, this.costLimit));
        } else {
          console.log(this.onError(this.cost, this.costLimit));
          throw new GraphQLError('You are asking for ' + this.cost + ' records. This is ' + (this.cost - this.costLimit) + ' greater than the permitted request');
        }
      } else if (typeof this.onSuccess === 'function') {
        console.log(this.onSuccess(this.cost));
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