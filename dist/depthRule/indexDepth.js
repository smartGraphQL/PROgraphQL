'use strict';

var DepthComplexity = require('./depthComplexity');

var _require = require('graphql'),
    ValidationContext = _require.ValidationContext;

var depthComplexityWrapper = function depthComplexityWrapper(depth) {
	return function (ValidationContext) {
		var result = new DepthComplexity(ValidationContext, depth);
		console.log(result);
		return result;
	};
};

module.exports = depthComplexityWrapper;