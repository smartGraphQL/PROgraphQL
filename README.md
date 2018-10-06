
# SmartGraphQL

## GraphQL Query Cost & Depth Complexity Analysis

The SmartGraphQL library enables users to limit the depth and complexity of queries to their GraphQL server, preventing resource exhaustion.

Compatible with Express and Apollo-Server validation rules.

## Installation

Install this package via npm 

```
npm install -s smartgraphql 
```

## Usage

Set a limit for Cost Complexity by creating a object with the following properties: 

```javascript
const ruleCost = {

  // All queries with a cost above this limit will be rejected and throw an error
  costLimit: 500,

  // Optional onSuccess method which will confirm the query has successfully passed the cost limit check with a customizable 	  message
  onSuccess: cost => `Complete, query cost is ${cost}`,

// Optional onError method to alert user that the query has been rejected with a customizable message
  onError: (cost, costLim) => `Error: Cost is ${cost} but cost limit is set to ${costLim}`,

};
```

Set a limit for query depth by creating a object with the following properties.

```javascript
const ruleDepth = {

// All queries with a depth above 'depthLimit' will be rejected and throw a GraphQLError before resolving.
  depthLimit: 100,

// Optional onSuccess method which will confirm the query has successfully passed the cost limit check with a customizable      message.
  onSuccess: depth => `Complete, query depth is ${depth}`,

// Optional onError method to alert user that the query has been rejected with a customizable GraphQLError
  onError: (depth, maximumDepth) => `Error: Current depth is ${depth} but max depth is 
	   ${maximumDepth}`

};
```

## Depth Calculation

Depth is calculated by how nested the query is. For example, the following queries are incrementally increasing:

```graphql
// ** depth = 1
query{
  Author(id:1) {
    Name
  }
}

// ** depth = 2
query{
  Author(id:1) {
    Name
    Books{
       Name
    }
  }
}

// ** depth = 3
query{
  Author(id:1) {
    Name
    Books{
      Name
      Genre{
	 Books 
  }
}
```
Inline Fragments and Fragments will not cause the query depth to increase. For example in both the following cases the query depth will remain 1: 

```graphql
//Inline Fragment
query{
  Author(id:1) {
    Name
    ... on Books{
	Pages
    }
  }
}

//Fragment
query{
  Author(id:1) {
    Name
    ...books
  }
}

fragment books on Author{
      Name
      Year
      Genre
}
```

Cyclical Queries can cause servers to crash by being nested to a large amount, and this is where setting a depth limit becomes useful. A depth limit can reject cyclical queries such as the following: 

```graphql
query{
  Artists{
    Name
    Songs{
      Name
      Artist{
        Name
        Songs{
          Name
           etc...
        }
      }
    }
  }
}
```

## Cost Calculation

Cost is calculated based on the number of times a resolve function makes a connection to the database. For example:

```graphql
query{
  artists(first: 100){
    name
    songs(first: 50){
      name
      genre{
        name
        songs(first: 10){
          name
        }
      }
    }
  }
}
```

This query would result in a cost of 5101, which can be broken down into the following steps:

- The initial request cost is 1 because although we’re return the first 100 artists, there will only be one connection to the database. 
- For songs we will need to connect once for each artist to get a list of their first 50 songs, so that will be 100 connections.
- For the 'songs' field inside genre, you will need to make one connection for the 5000 songs, so that will be 5000

Total Cost is 5101

## Usage with express-graphql

Integrating the rules inside the validation rules will look like this, the limit will be manadatory, but the onSuccess and onError function are optional 

```javascript
const ruleCost = {
  costLimit: 10000,
  onSuccess: cost => `Complete, query cost is ${cost}`,
  onError: (cost, costLim) => `Error: Cost is ${cost} but cost limit is set to ${costLim}`,
};

const ruleDepth = {
  depthLimit: 100,
  onSuccess: depth => `Complete, query depth is ${depth}`,
  onError: (depth, maximumDepth) => `Error: Current depth is ${depth} but max depth is ${maximumDepth}`,
};

app.use(
  '/graphql',
  graphqlHTTP(() => ({
    schema,
    graphiql: true,
    validationRules: [depthComplexity(ruleDepth), costLimit(ruleCost)],
  })),
);
```

## Credits

Developed by Julia, Manjeet, Mark & Seth
