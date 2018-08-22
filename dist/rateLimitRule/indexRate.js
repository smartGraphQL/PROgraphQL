'use strict';

var RateLimitComplexity = require('./rateLimit');


var RateLimitWrapper = function RateLimitWrapper(rule) {
	return function (context) {
		var result = new RateLimitComplexity(context, rule);
		return result;
	};
};

module.exports = RateLimitWrapper;