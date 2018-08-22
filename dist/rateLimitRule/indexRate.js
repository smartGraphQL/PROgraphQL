'use strict';

var RateLimitComplexity = require('./rateLimit');


var RateLimitWrapper = function RateLimitWrapper(rule) {
	return function (context) {
		var result = new RateLimitComplexity(context, rule.maximumCapacity);
		return result;
	};
};

module.exports = RateLimitWrapper;