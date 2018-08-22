'use strict';

var DepthComplexity = require('./depthComplexity');

var _require = require('graphql'),
    ValidationContext = _require.ValidationContext;

var depthComplexity = function depthComplexity(rule) {
	return function (context) {
		var result = new DepthComplexity(context, rule);
		return result;
	};
};

module.exports = depthComplexity;