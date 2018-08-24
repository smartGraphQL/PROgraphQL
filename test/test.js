const {
  parse,
  TypeInfo,
  ValidationContext,
  visit,
  visitWithTypeInfo,
  GraphQLError,
} = require('graphql');

const CostLimitComplexity = require('../src/rateLimitRule/costLimit');
const schema = require('./mock_schema/schema');
const costLimit = require('../src/rateLimitRule/indexCost');

/**
 * Complexity Cost Tests
 */
describe('Query Complexity Analysis', () => {
  const typeInfo = new TypeInfo(schema);

  test('initial cost should be 0', () => {
    const context = new ValidationContext(schema);
    const complexity = new CostLimitComplexity(context);
    expect(complexity.cost).toBe(0);
  });

  test('cost limit set by user should be greater than 0', () => {
    expect(() => {
      costLimit({ costLimit: 0 });
    }).toThrowError(GraphQLError);
  });

  test('should calculate cost of query without arguments', () => {
    const ruleCost = {
      costLimit: 10,
    };
    const ast = parse(`
      query {
        item {
          scalar
        }
      }
    `);

    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity = new CostLimitComplexity(context, ruleCost);

    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(1);
  });

  test('should calculate cost of query if arguments are provided', () => {
    const ast = parse(`
      query {
        item(count:5) {
          variableScalar (count:5) {
           item 
          }
        }
      }
    `);

    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity = new CostLimitComplexity(context, { costLimit: 766 });
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(6);
  });

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
                yearscalar
              }
            }
          }
        }
      }
    `);

    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity = new CostLimitComplexity(context, { costLimit: 69 });
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(5);
    console.log(complexity.config.costLimit, 'COST');
  });

  test('should calculate cost of query if arguments are provided', () => {
    const ast = parse(`
      query {
        name(first: 5) {
          address {
            street(first:5) {
              building {
                apt
              }
            }
          }
        }
      }
    `);

    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity = new CostLimitComplexity(context, { costLimit: 36 });
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(36);
  });

  test('should properly calculate cost on queries containing interfaces', () => {
    const ast = parse(`
      query {
        interface {
         name
         ... on NameInterface {
           name
         }
         item {
           scalar
         }
        }
      }
    `);

    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity = new CostLimitComplexity(context, { costLimit: 36 });
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(2);
  });

  test('should throw an error if actual query cost is greater than cost limit', () => {
    const ast = parse(`
      query{
        item {
          scalar(first: 25) {
            name (first: 10)
          }
        }
      }
    `);

    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity2 = new CostLimitComplexity(context, { costLimit: 0, onError: 'asd' });

    expect(() => {
      visit(ast, visitWithTypeInfo(typeInfo, complexity2));
    }).toThrowError(GraphQLError);
  });

  test('should properly calculate cost on fragments', () => {
    const ast = parse(`
      query {
        scalar {
          ...QueryFragment
        }
      }

      fragment QueryFragment on Query {
        scalar
        scalar
        scalar
      }
    `);

    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity = new CostLimitComplexity(context, { costLimit: 36 });
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(1);
  });
});
