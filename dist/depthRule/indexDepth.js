'use strict';

var DepthComplexity = require('./depthComplexity');

var _require = require('graphql'),
    ValidationContext = _require.ValidationContext;

var depthComplexityWrapper = function depthComplexityWrapper(rule) {
	return function (context) {
		var result = new DepthComplexity(context, rule);
		return result;
	};
};

module.exports = depthComplexityWrapper;