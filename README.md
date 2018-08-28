# PROgraphQL

## GraphQL Query & Depth Complexity Analysis

The Pro-GraphQL library enables users to limit the depth and complexity of queries to their GraphQL server which in turn prevent resource exhaustion and DOS attacks. 

Works with Express.js

## Installation

Install this package via npm 

```
npm install -s pro-graphql 
```

## Usage

Create rule for Cost Complexity 

```javascript
const ruleCost = {

  //All queries with this cost or above will be rejected and throw an error
  costLimit: 10000,

  //Optional onSuccess method which will confirm the query has successfully passed the cost limit check with a customizable message
  onSuccess: cost => `Complete, query cost is ${cost}`,

//Optional onError method to alert user that the query has been rejected with a customizable message
  onError: (cost, costLim) => `Error: Cost is ${cost} but cost limit is set to ${costLim}`,

};
```

Create rule of Depth Complexity

```javascript
const ruleDepth = {

//All queries with this depth or above will be rejected and throw an error
  depthLimit: 100,

 //Optional onSuccess method which will confirm the query has successfully passed the cost limit check with a customizable message
  onSuccess: depth => `Complete, query depth is ${depth}`,

//Optional onError method to alert user that the query has been rejected with a customizable message
  onError: (depth, maximumDepth) => `Error: Current depth is ${depth} but max depth is 
${maximumDepth}`,

};
```

## Depth Calculation

Depth is calculated by how nested the query is for example the following queries are incrementally increasing in depth from 1 to 3:

```javascript
{
  Author(id:1) {
    Name
  }
}

{
  Author(id:1) {
    Name
    Books{
           Name
  }
}

{
  Author(id:1) {
    Name
    Books{
        Name
	Genre{
	      Books 
  }
}
```
Inline Fragments and Fragments will not cause the query to increase for example in both the following case the query depth will remain 1: 

```javascript
//Inline Fragment
{
  Author(id:1) {
    Name
    …. on Books{
	Name
    }
  }
}

//Fragment
{
  Author(id:1) {
    Name
    …. books
  }
}

fragment books on Author{
      Name
      Year
      Genre
}
```

Cyclical Queries can cause servers to crash by being nested to a large amount, and this is where setting a limit comes into play, by rejecting cyclical queries such as the following: 

```javascript
{
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

```javascript
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

- The initial request is 1 because although we’re return the first 50 artists, there will only be one connection to the database 
- For songs we will need to go connect once for each artist to get a list of their first 50 songs, so that will be 100
- For the field songs inside genre, you will need to make one connection for the 5000 songs, so that will be 5000

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

Brought to you by Julia, Manjeet, Mark & Seth

