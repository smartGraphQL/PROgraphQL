const {
    GraphQLList,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLString,
    GraphQLInt,
    GraphQLEnumType,
    GraphQLUnionType,
    GraphQLInterfaceType,
  } = require ('graphql');
  
  const Item = new GraphQLObjectType({
    name: 'Item',
    fields: () => ({
      variableList: {
        type: Item,
        complexity: (args, childComplexity) => childComplexity * (args.count || 10),
        args: {
          count: {
            type: GraphQLInt
          }
        }
      },
      scalar: { type: GraphQLString },
      complexScalar: { type: GraphQLString, complexity: 20 },
      variableScalar: {
        type: Item,
        complexity: args => 10 * (args.count || 10),
        args: {
          count: {
            type: GraphQLInt
          }
        }
      },
      list: { type: new GraphQLList(Item) },
      nonNullItem: {
        type: new GraphQLNonNull(Item),
        resolve: () => ({}),
      },
      nonNullList: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Item))),
        resolve: () => [],
      },
    }),
  });

  const NameInterface = new GraphQLInterfaceType({
    name: 'NameInterface',
    fields: {
      name: { type: GraphQLString }
    },
    resolveType: () => Item
  });
  
  const SecondItem = new GraphQLObjectType({
    name: 'SecondItem',
    fields: () => ({
      name: {type: GraphQLString},
      scalar: {type: GraphQLString}
    }),
    interfaces: [ NameInterface ]
  });
  
  const EnumType = new GraphQLEnumType({
    name: 'RGB',
    values: {
      RED: { value: 0 },
      GREEN: { value: 1 },
      BLUE: { value: 2 }
    }
  });
  
  const Union = new GraphQLUnionType({
    name: 'Union',
    types: [ Item, SecondItem ],
    resolveType: () => Item
  });
  
  const Query = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      name: { type: GraphQLString },
      variableList: {
        type: Item,
        complexity: (args, childComplexity) => childComplexity * (args.count || 10),
        args: {
          count: {
            type: GraphQLInt
          }
        }
      },
      interface: {type: NameInterface},
      enum: {type: EnumType},
      scalar: { type: GraphQLString },
      complexScalar: { type: GraphQLString, complexity: 20 },
      union: { type: Union },
      variableScalar: {
        type: Item,
        complexity: args => 10 * (args.count || 10),
        args: {
          count: {
            type: GraphQLInt
          }
        }
      },
      list: { type: new GraphQLList(Item) },
      nonNullItem: {
        type: new GraphQLNonNull(Item),
        resolve: () => ({}),
      },
      nonNullList: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Item))),
        resolve: () => [],
      },
      requiredArgs: {
        type: Item,
        args: {
          count: {
            type: new GraphQLNonNull(GraphQLInt)
          }
        }
      }
    }),
  });
  
  module.exports = new GraphQLSchema({ query: Query });