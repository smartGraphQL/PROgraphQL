'use strict';

var _require = require('graphql'),
    GraphQLList = _require.GraphQLList,
    GraphQLObjectType = _require.GraphQLObjectType,
    GraphQLNonNull = _require.GraphQLNonNull,
    GraphQLSchema = _require.GraphQLSchema,
    GraphQLString = _require.GraphQLString,
    GraphQLInt = _require.GraphQLInt,
    GraphQLEnumType = _require.GraphQLEnumType,
    GraphQLUnionType = _require.GraphQLUnionType,
    GraphQLInterfaceType = _require.GraphQLInterfaceType;

var Item = new GraphQLObjectType({
  name: 'Item',
  fields: function fields() {
    return {
      variableList: {
        type: Item,
        complexity: function complexity(args, childComplexity) {
          return childComplexity * (args.count || 10);
        },
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
        complexity: function complexity(args) {
          return 10 * (args.count || 10);
        },
        args: {
          count: {
            type: GraphQLInt
          }
        }
      },
      list: { type: new GraphQLList(Item) },
      nonNullItem: {
        type: new GraphQLNonNull(Item),
        resolve: function resolve() {
          return {};
        }
      },
      nonNullList: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Item))),
        resolve: function resolve() {
          return [];
        }
      }
    };
  }
});

var NameInterface = new GraphQLInterfaceType({
  name: 'NameInterface',
  fields: {
    name: { type: GraphQLString }
  },
  resolveType: function resolveType() {
    return Item;
  }
});

var SecondItem = new GraphQLObjectType({
  name: 'SecondItem',
  fields: function fields() {
    return {
      name: { type: GraphQLString },
      scalar: { type: GraphQLString }
    };
  },
  interfaces: [NameInterface]
});

var EnumType = new GraphQLEnumType({
  name: 'RGB',
  values: {
    RED: { value: 0 },
    GREEN: { value: 1 },
    BLUE: { value: 2 }
  }
});

var Union = new GraphQLUnionType({
  name: 'Union',
  types: [Item, SecondItem],
  resolveType: function resolveType() {
    return Item;
  }
});

var Query = new GraphQLObjectType({
  name: 'Query',
  fields: function fields() {
    return {
      name: { type: GraphQLString },
      variableList: {
        type: Item,
        complexity: function complexity(args, childComplexity) {
          return childComplexity * (args.count || 10);
        },
        args: {
          count: {
            type: GraphQLInt
          }
        }
      },
      interface: { type: NameInterface },
      enum: { type: EnumType },
      scalar: { type: GraphQLString },
      complexScalar: { type: GraphQLString, complexity: 20 },
      union: { type: Union },
      variableScalar: {
        type: Item,
        complexity: function complexity(args) {
          return 10 * (args.count || 10);
        },
        args: {
          count: {
            type: GraphQLInt
          }
        }
      },
      list: { type: new GraphQLList(Item) },
      nonNullItem: {
        type: new GraphQLNonNull(Item),
        resolve: function resolve() {
          return {};
        }
      },
      nonNullList: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Item))),
        resolve: function resolve() {
          return [];
        }
      },
      requiredArgs: {
        type: Item,
        args: {
          count: {
            type: new GraphQLNonNull(GraphQLInt)
          }
        }
      }
    };
  }
});

module.exports = new GraphQLSchema({ query: Query });