const {
    parse,
    TypeInfo,
    ValidationContext,
    visit,
    visitWithTypeInfo,
  } = require ('graphql');

const RateLimitComplexity = require('.././dist/rateLimitRule/costLimit');
const schema = require('./mock_schema/schema');

describe('Query Complexity Analysis', () => {
    const typeInfo = new TypeInfo(schema);

  test('starting complexity should be 0', () => {
        const context = new ValidationContext(schema);
        const complexity = new RateLimitComplexity(context, 2);
        expect(complexity.cost).toBe(0);
  })

  test('should calculate cost of query without arguments', () => {
    const ast = parse(`
      query {
        artists {
          name {
            songs {
              name
            }
            albums {
              songs {
                year
              }
            }
          }
        }
      }
    `);

    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity = new RateLimitComplexity(context, 16);
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(5);
  });

  test('should calculate cost of query if arguments are provided', () => {
    const ast = parse(`
      query {
        name(first: 5) {
          address {
            street {
              building 
            }
          }
        }
      }
    `);

    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity = new RateLimitComplexity(context, 45);
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(11);
  });
});
