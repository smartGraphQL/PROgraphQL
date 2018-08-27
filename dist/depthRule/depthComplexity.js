'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('graphql'),
    GraphQLError = _require.GraphQLError;

var DepthComplexity = function () {
  function DepthComplexity(context, config) {
    _classCallCheck(this, DepthComplexity);

    this.context = context;
    this.operationDefinitionDepth = 0;
    this.fragmentDefinitionDepth = 0;
    this.actualDepth = 0;
    this.config = config;

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
      var isFragment = true;
      this.calculateDepth(fragment, -1, isFragment);
    }
  }, {
    key: 'onOperationDefinitionEnter',
    value: function onOperationDefinitionEnter(operationNode) {
      this.calculateDepth(operationNode, 0, false);
    }
  }, {
    key: 'calculateDepth',
    value: function calculateDepth(node) {
      var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var _this = this;

      var isFragment = arguments[2];
      var nodeArray = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

      if (!node.selectionSet) return;else {
        nodeArray = nodeArray.concat(node.selectionSet.selections);
        depth += 1;
        nodeArray.forEach(function (childNode) {
          if (isFragment) _this.calculateDepth(childNode, depth, isFragment);else _this.calculateDepth(childNode, depth, false);
        });
      }
    }
  }, {
    key: 'onOperationDefinitionLeave',
    value: function onOperationDefinitionLeave() {
      this.validateQuery();
    }
  }, {
    key: 'onFragmentDefinitionLeave',
    value: function onFragmentDefinitionLeave() {
      this.validateQuery();
    }
  }, {
    key: 'calculateDepth',
    value: function calculateDepth(node) {
      var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var _this2 = this;

      var isFragment = arguments[2];
      var nodeArray = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

      if (!node.selectionSet) return;else {
        nodeArray = nodeArray.concat(node.selectionSet.selections);
        depth += 1;
        nodeArray.forEach(function (childNode) {
          if (isFragment) _this2.calculateDepth(childNode, depth, isFragment);else _this2.calculateDepth(childNode, depth);
        });
      }

      if (isFragment) {
        this.fragmentDefinitionDepth = Math.max(this.fragmentDefinitionDepth, depth);
        this.actualDepth = this.operationDefinitionDepth + this.fragmentDefinitionDepth;
      } else {
        this.operationDefinitionDepth = Math.max(this.operationDefinitionDepth, depth);
        this.actualDepth = this.operationDefinitionDepth;
      }
    }
  }, {
    key: 'validateQuery',
    value: function validateQuery() {
      var _config = this.config,
          depthLimit = _config.depthLimit,
          onSuccess = _config.onSuccess,
          onError = _config.onError;
      var actualDepth = this.actualDepth;


      if (depthLimit < actualDepth) {
        if (onError) throw new GraphQLError(onError(actualDepth, depthLimit));else throw new GraphQLError('Current query depth of ' + actualDepth + ' exceeds set depth limit of ' + depthLimit);
      } else if (onSuccess) onSuccess(actualDepth);
    }
  }]);

  return DepthComplexity;
}();

module.exports = DepthComplexity;