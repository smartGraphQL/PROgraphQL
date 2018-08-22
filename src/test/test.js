const {
    parse,
    TypeInfo,
    ValidationContext,
    visit,
    visitWithTypeInfo,
  } = require ('graphql');

const RateLimitComplexity = require('.././rateLimitRule/rateLimit');
const schema = require('./assets/schema');

// test('adds 1 + 2 to equal 3', () => {
//   expect(rateLimit.sum(1, 2)).toBe(3);
// });

// describe('Addition', () => {
//     test('knows that 2 and 2 make 4', () => {
//       expect(rateLimit.sum(2, 2)).toBe(4);
//     });
//   });
describe('QueryComplexity analysis', () => {
    const typeInfo = new TypeInfo(schema);
  test('should consider default scalar cost', () => {
    const ast = parse(`
      query {
        name 
      }
    `);

    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity = new RateLimitComplexity(context, 2);
      console.log(ast.definitions[0].selectionSet)
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(1);
  });
});