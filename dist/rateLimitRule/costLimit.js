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
      console.log(node.selectionSet);
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
            _this.calculateCost(childNode);
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
      // const { costLimit, onSuccess, onError } = this.config;

      if (this.config.costLimit < this.cost) {
        console.log('LIMIT', this.config.costLimit, '\nACTUAL COST', this.cost);
        if (typeof onError === 'function') throw new GraphQLError('ERRORSROS IS FUNCTION CONDITOINAL');else {
          console.log('ERRROROSRO');
          // console.log(this.config.onError(this.cost, this.config.costLimit));
          throw new GraphQLError('Actual cost is greater than set cost limit.');
        }
      } else if (typeof this.config.onSuccess === 'function') {
        console.log(this.config.onSuccess(this.cost));
      }
    }
  }, {
    key: 'onOperationDefinitionLeave',
    value: function onOperationDefinitionLeave() {
      // console.log(this.config);
      return this.validateQuery();
    }
  }]);

  return CostLimitComplexity;
}();

module.exports = CostLimitComplexity;