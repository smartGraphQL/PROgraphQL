'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('graphql'),
    GraphQLError = _require.GraphQLError;

var CostComplexity = function () {
  function CostComplexity(context, config) {
    _classCallCheck(this, CostComplexity);

    this.context = context;
    this.config = config;
    this.cost = 0;

    this.argsArray = [];
    this.fragmentsList = {};

    this.validateOnFragment = true;

    this.OperationDefinition = {
      enter: this.onOperationDefinitionEnter,
      leave: this.onOperationDefinitionLeave
    };

    this.FragmentDefinition = {
      enter: this.onFragmentDefinitionEnter,
      leave: this.onFragmentDefinitionLeave
    };
  }

  _createClass(CostComplexity, [{
    key: 'onOperationDefinitionEnter',
    value: function onOperationDefinitionEnter(operationNode) {
      this.calculateCost(operationNode);
    }
  }, {
    key: 'onOperationDefinitionLeave',
    value: function onOperationDefinitionLeave() {
      this.validateQuery();
    }
  }, {
    key: 'onFragmentDefinitionEnter',
    value: function onFragmentDefinitionEnter(fragment) {
      var fragName = fragment.name.value;

      if (this.fragmentsList[fragName]) {
        var _fragmentsList$fragNa = this.fragmentsList[fragName],
            currentCost = _fragmentsList$fragNa.currentCost,
            localArgs = _fragmentsList$fragNa.localArgs;

        this.calculateCost(fragment, localArgs, currentCost);
      }
    }
  }, {
    key: 'onFragmentDefinitionLeave',
    value: function onFragmentDefinitionLeave() {
      if (this.validateOnFragment) this.validateQuery();
    }
  }, {
    key: 'calculateCost',
    value: function calculateCost(node) {
      var _this = this;

      var localArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var currentCost = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      this.cost = Math.max(this.cost, currentCost);

      if (node.selectionSet) {
        var selections = node.selectionSet.selections;

        var costArray = new Array(selections.length);

        selections.forEach(function (childNode, index) {
          var modifiedLocalArgs = [].concat(localArgs);
          var args = _this.getArguments(childNode);
          if (args && (args['first'] || args['last'])) {
            costArray[index] = _this.updateCost(currentCost, modifiedLocalArgs);
            _this.updateLocalArgsArr(modifiedLocalArgs, args['first'] || args['last']);
          }
          _this.calculateCost(childNode, modifiedLocalArgs, costArray[index] || currentCost);
        });
      } else if (node.kind === 'FragmentSpread') this.fragmentsList[node.name.value] = { currentCost: currentCost, localArgs: localArgs };
    }
  }, {
    key: 'getArguments',
    value: function getArguments(node) {
      if (node.arguments) {
        var argObj = {};
        node.arguments.forEach(function (nodeArg) {
          return argObj[nodeArg.name.value] = nodeArg.value.value;
        });
        return argObj;
      }
      return false;
    }
  }, {
    key: 'updateCost',
    value: function updateCost(currentCost, array) {
      if (array.length > 0) {
        return currentCost += array.reduce(function (product, num) {
          return product * num;
        }, 1);
      }
    }
  }, {
    key: 'updateLocalArgsArr',
    value: function updateLocalArgsArr(arr, argumentValue) {
      arr.push(argumentValue);
    }
  }, {
    key: 'validateQuery',
    value: function validateQuery() {
      var _config = this.config,
          costLimit = _config.costLimit,
          onSuccess = _config.onSuccess,
          onError = _config.onError;


      if (costLimit < this.cost) {
        this.validateQueryOnFragment = false;
        if (onError) throw new GraphQLError(onError(this.cost, costLimit));else throw new GraphQLError('The complexity score of current query is ' + this.cost + ', \n          max complexity score is currently set to ' + costLimit + '.');
      } else if (onSuccess) console.log(onSuccess(this.cost));
    }
  }]);

  return CostComplexity;
}();

module.exports = CostComplexity;