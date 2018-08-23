'use strict';

var _require = require('graphql'),
    parse = _require.parse,
    TypeInfo = _require.TypeInfo,
    ValidationContext = _require.ValidationContext,
    visit = _require.visit,
    visitWithTypeInfo = _require.visitWithTypeInfo;

var RateLimitComplexity = require('.././rateLimitRule/rateLimit');
var schema = require('./assets/schema');

describe('Query Complexity Analysis', function () {
  var typeInfo = new TypeInfo(schema);

  test('initial complexity should be 0', function () {
    var context = new ValidationContext(schema);
    var complexity = new RateLimitComplexity(context, 2);
    expect(complexity.cost).toBe(0);
  });

  test('should calculate cost of query without arguments', function () {
    var ast = parse('\n      query {\n        artists {\n          name {\n            songs {\n              name\n            }\n            albums {\n              songs {\n                year\n              }\n            }\n          }\n        }\n      }\n    ');

    var context = new ValidationContext(schema, ast, typeInfo);
    var complexity = new RateLimitComplexity(context, 16);
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(5);
  });

  test('should calculate cost of query if arguments are provided', function () {
    var ast = parse('\n      query {\n        name(first: 5) {\n          address {\n            street(first:5) {\n              building {\n                apt\n              }\n            }\n          }\n        }\n      }\n    ');

    var context = new ValidationContext(schema, ast, typeInfo);
    var complexity = new RateLimitComplexity(context, 45);
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(16);
  });
});