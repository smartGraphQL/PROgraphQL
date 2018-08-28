'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('graphql'),
    GraphQLError = _require.GraphQLError;

var CostLimitComplexity = function () {
  function CostLimitComplexity(context, config) {
    _classCallCheck(this, CostLimitComplexity);

    this.context = context;
    this.argsArray = [];
    this.cost = 0;
    this.config = config;

    this.fragments = {};
    this.validateQueryOnFragment = true;

    this.OperationDefinition = {
      enter: this.onOperationDefinitionEnter,
      leave: this.onOperationDefinitionLeave
    };

    this.FragmentDefinition = {
      enter: this.onFragmentDefinitionEnter,
      leave: this.onFragmentDefinitionLeave
    };
  }

  _createClass(CostLimitComplexity, [{
    key: 'onOperationDefinitionEnter',
    value: function onOperationDefinitionEnter(operationNode) {
      // this.calculateCost(operationNode);
      this.calculateCostVersion1(operationNode);
    }
  }, {
    key: 'onOperationDefinitionLeave',
    value: function onOperationDefinitionLeave() {
      this.validateQuery();
    }
  }, {
    key: 'onFragmentDefinitionEnter',
    value: function onFragmentDefinitionEnter(fragment) {
      var name = fragment.name.value;
      if (this.fragments[name]) {
        var currentCost = this.fragments[name].currentCost;
        var localArgs = this.fragments[name].localArgs;
        this.calculateCostVersion1(fragment, localArgs, currentCost);
      }
    }
  }, {
    key: 'onFragmentDefinitionLeave',
    value: function onFragmentDefinitionLeave() {
      if (this.validateQueryOnFragment) {
        this.validateQuery();
      }
    }
  }, {
    key: 'calculateCostVersion1',
    value: function calculateCostVersion1(node) {
      var _this = this;

      var localArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var currentCost = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      console.log('LOCAL ARGS ', localArgs);
      console.log('CURRENT COSTTT ', currentCost);
      // if(node.kind === 'Field') console.log('field Name ', node.name.value);
      this.cost = Math.max(this.cost, currentCost);

      if (node.selectionSet) {
        var costArray = new Array(node.selectionSet.selections.length);
        node.selectionSet.selections.forEach(function (childNode, index) {
          var modifiedLocalArgs = [].concat(localArgs);
          var args = _this.getArguments(childNode);
          if (args && (args['first'] || args['last'])) {
            costArray[index] = _this.updateCost(currentCost, modifiedLocalArgs);
            _this.updateLocalArgumentsArray(modifiedLocalArgs, args['first'] || args['last']);
          }
          // this.updateArgumentArrayVersion1(modifiedLocalArgs,childNode, costArray,index,currentCost);
          console.log('costArray[index]  ', costArray[index]);
          _this.calculateCostVersion1(childNode, modifiedLocalArgs, costArray[index] || currentCost);
        });
      } else {
        // console.log('Reached leaf nodeee',node.kind);
        console.log('IAM DONE');
        if (node.kind === 'FragmentSpread') {
          this.fragments[node.name.value] = { currentCost: currentCost, localArgs: localArgs };
        }
        return;
      }
    }
  }, {
    key: 'getArguments',
    value: function getArguments(node) {
      var argObj = void 0;
      if (node.arguments) {
        argObj = {};
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
      var product = array.reduce(function (product, num) {
        return product * num;
      }, 1);
      console.log('PRODUCTTT', product);
      return currentCost + product;
    }
  }, {
    key: 'updateLocalArgumentsArray',
    value: function updateLocalArgumentsArray(array, argumentValue) {
      array.push(argumentValue);
    }
  }, {
    key: 'updateArgumentArrayVersion1',
    value: function updateArgumentArrayVersion1(array, node, costArray, index, currentCost) {
      if (node.arguments) {
        node.arguments.forEach(function (argNode) {
          if ((argNode.name.value === 'first' || argNode.name.value === 'last') && argNode.value.kind === 'IntValue') {

            console.log('argNode name ', argNode.name);
            var argValue = Number(argNode.value.value);
            isNaN(argValue) ? '' : array.push(argValue);
          }
        });
      }

      console.log(array);
    }
  }, {
    key: 'updateArgumentArray',
    value: function updateArgumentArray(addConstant, node) {
      var _this2 = this;

      if (addConstant) this.argsArray.push(1);else if (typeof node !== 'undefined' && node.arguments) {
        node.arguments.forEach(function (argNode) {
          if ((argNode.name === 'first' || 'last') && argNode.value.kind === 'IntValue') {
            var argValue = Number(argNode.value.value);
            isNaN(argValue) ? '' : _this2.argsArray.push(argValue);
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
      var _this3 = this;

      if (node.kind === 'FragmentSpread') return;
      if (node.selectionSet) {
        node.selectionSet.selections.forEach(function (child) {
          if (child.kind === 'Field') {
            if (_this3.argsArray.length === 0) _this3.queryFirstIteration(child);else if (child.arguments && child.arguments.length > 0) {
              _this3.cost += _this3.argsArray.reduce(function (product, num) {
                return product * num;
              }, 1);

              _this3.updateArgumentArray(false, child);
              _this3.calculateCost(child);
            } else if (child.arguments && child.arguments.length == 0 && child.selectionSet) {
              _this3.cost += _this3.argsArray.reduce(function (product, num) {
                return product * num;
              }, 1);

              _this3.updateArgumentArray(true);
              _this3.calculateCost(child);
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
      var cost = this.cost;

      console.log('COSTTT ', cost);
      if (costLimit < cost) {
        this.validateQueryOnFragment = false;
        if (onError) throw new GraphQLError(onError(cost, costLimit));else throw new GraphQLError('The complexity score of current query is ' + cost + ', max complexity score is currently set to ' + costLimit + '.');
      } else if (onSuccess) onSuccess(cost);
    }
  }]);

  return CostLimitComplexity;
}();

module.exports = CostLimitComplexity;