'use strict';

var CostComplexityOptions = require('./costLimit');


var costLimit = function costLimit(rule) {
	if (rule.costLimit <= 0) {
		throw new GraphQLError('Cost limit must be greater than 0');
	}
	return function (context) {
		var result = new CostComplexityOptions(context, rule);
		return result;
	};
};

module.exports = costLimit;