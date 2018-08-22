'use strict';

var CostComplexityOptions = require('./costLimit');


var costLimit = function costLimit(rule) {
	return function (context) {
		var result = new CostComplexityOptions(context, rule);
		return result;
	};
};

module.exports = costLimit;