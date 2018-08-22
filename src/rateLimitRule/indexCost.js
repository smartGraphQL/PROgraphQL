const CostComplexityOptions = require('./costLimit');
import type {ValidationContext} from 'graphql';
import type {costComplexityOptions} from './costLimit';

const costLimit = (rule: costComplexityOptions):Function =>{
	return (context:ValidationContext):CostComplexityOptions => {
		let result = new CostComplexityOptions(context:ValidationContext, rule:costComplexityOptions);
		return result;
	}
}

module.exports = costLimit;
