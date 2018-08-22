const RateLimitComplexity = require('./rateLimit');
import type {ValidationContext} from 'graphql';
import type {rateComplexityOptions} from './rateLimit';

const RateLimitWrapper = (rule: rateComplexityOptions):Function =>{
	return (context:ValidationContext):RateLimitComplexity => {
		let result = new RateLimitComplexity(context:ValidationContext, rule.maximumCapacity:number);
		return result;
	}
}

module.exports = RateLimitWrapper;
