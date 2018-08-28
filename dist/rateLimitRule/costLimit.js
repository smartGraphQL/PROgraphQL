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

    this.fragmentsList = {};
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
      var fragName = fragment.name.value;

      if (this.fragmentsList[fragName]) {
        var _fragmentsList$fragNa = this.fragmentsList[fragName],
            currentCost = _fragmentsList$fragNa.currentCost,
            localArgs = _fragmentsList$fragNa.localArgs;

        this.calculateCostVersion1(fragment, localArgs, currentCost);
      }
    }
  }, {
    key: 'onFragmentDefinitionLeave',
    value: function onFragmentDefinitionLeave() {
      if (this.validateQueryOnFragment) this.validateQuery();
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
        var selections = node.selectionSet.selections;

        var costArray = new Array(selections.length);

        selections.forEach(function (childNode, index) {
          var modifiedLocalArgs = [].concat(localArgs);
          var args = _this.getArguments(childNode) || null;
          if (args && (args['first'] || args['last'])) {
            costArray[index] = _this.updateCost(currentCost, modifiedLocalArgs);
            _this.updateLocalArgsArr(modifiedLocalArgs, args['first'] || args['last']);
          }
          console.log('costArray[index]  ', costArray[index]);
          _this.calculateCostVersion1(childNode, modifiedLocalArgs, costArray[index] || currentCost);
        });
      } else if (node.kind === 'FragmentSpread') this.fragments[node.name.value] = { currentCost: currentCost, localArgs: localArgs };
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
      return currentCost += array.reduce(function (product, num) {
        return product * num;
      }, 1);
      // return currentCost + product;
    }
  }, {
    key: 'updateLocalArgsArr',
    value: function updateLocalArgsArr(arr, argumentValue) {
      arr.push(argumentValue);
    }

    /*
    ** Old calculate cost functions 
    **/

    /*
    updateArgumentArray(addConstant: boolean, node?: FieldNode): void {
      if (addConstant) this.argsArray.push(1);
      else if (typeof node !== 'undefined' && node.arguments) {
        node.arguments.forEach(argNode => {
          if ((argNode.name === 'first' || 'last') && argNode.value.kind === 'IntValue') {
            const argValue = Number(argNode.value.value);
            isNaN(argValue) ? '' : this.argsArray.push(argValue);
          }
        });
      }
    }
     queryFirstIteration(node: FieldNode): void {
      this.cost += 1;
       if (node.arguments) this.updateArgumentArray(false, node);
      else this.updateArgumentArray(true);
       this.calculateCost(node);
    }
     calculateCost(
      node:
        | OperationDefinitionNode
        | FieldNode
        | FragmentSpreadNode
        | InlineFragmentNode
        | FragmentDefinitionNode,
    ): void {
      if (node.kind === 'FragmentSpread') return;
      if (node.selectionSet) {
        node.selectionSet.selections.forEach(child => {
          if (child.kind === 'Field') {
            if (this.argsArray.length === 0) this.queryFirstIteration(child);
            else if (child.arguments && child.arguments.length > 0) {
              this.cost += this.argsArray.reduce((product, num) => product * num, 1);
               this.updateArgumentArray(false, child);
              this.calculateCost(child);
            } else if (child.arguments && child.arguments.length == 0 && child.selectionSet) {
              this.cost += this.argsArray.reduce((product, num) => product * num, 1);
               this.updateArgumentArray(true);
              this.calculateCost(child);
            }
          }
        });
      }
    }
    */

  }, {
    key: 'validateQuery',
    value: function validateQuery() {
      var _config = this.config,
          costLimit = _config.costLimit,
          onSuccess = _config.onSuccess,
          onError = _config.onError;


      console.log('COSTT', this.cost);
      if (costLimit < this.cost) {
        this.validateQueryOnFragment = false;
        if (onError) throw new GraphQLError(onError(this.cost, costLimit));else throw new GraphQLError('The complexity score of current query is ' + this.cost + ', max complexity score is currently set to ' + costLimit + '.');
      } else if (onSuccess) onSuccess(cost);
    }
  }]);

  return CostLimitComplexity;
}();

module.exports = CostLimitComplexity;