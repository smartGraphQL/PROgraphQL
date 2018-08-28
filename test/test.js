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

  test('should calculate cost of a simple query without arguments', () => {
    const ruleCost = {
      costLimit: 10,
    };
    const ast = parse(`
      query {
        item {
          scalar {
            name
          }
        }
      }
    `);

    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity = new CostLimitComplexity(context, ruleCost);
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(1);
  });

  test('should calculate cost of a complex query without arguments', () => {
    const ast = parse(`
    query {
      viewer {
        login
        repositories {
          edges {
            node {
              id
    
              issues {
                edges {
                  node {
                    id
    
                    labels {
                      edges {
                        node {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `);
    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity = new CostLimitComplexity(context, { costLimit: 69 });
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(1);
  });

  test('should calculate cost of a simple query if arguments are provided', () => {
    const ast = parse(`
      query {
        item(first:5) {
          variableScalar (last:5) {
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

  

  test('should calculate cost of a complex query if arguments are provided', () => {
    const ast = parse(`
    query {
      viewer {
        login
        repositories(first: 100) {
          edges {
            node {
              id
    
              issues(first: 50) {
                edges {
                  node {
                    id
    
                    labels(first: 60) {
                      edges {
                        node {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `);

    const context = new ValidationContext(schema, ast, typeInfo);
    const complexity = new CostLimitComplexity(context, { costLimit: 5101 });
    visit(ast, visitWithTypeInfo(typeInfo, complexity));
    expect(complexity.cost).toBe(5101);
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
    const complexity = new CostLimitComplexity(context, { costLimit: 1 });
    expect(() => {
      visit(ast, visitWithTypeInfo(typeInfo, complexity));
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
    expect(complexity.cost).toBe(1);
  });

});
