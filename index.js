const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const port = 3001;

const schema = buildSchema(`
  type Query {
    name: String
    age: Int
  }
`);

const root = {
    name: () => 'Robin',
    age: () => 26
};

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/graphql`);
});
