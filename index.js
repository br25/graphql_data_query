const fs = require('fs');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema, execute, parse } = require('graphql');

const userData = fs.readFileSync('user.json', 'utf8');
const users = JSON.parse(userData);

const app = express();
const port = 3001;

const schema = buildSchema(`
  type User {
    first_name: String
    last_name: String
    email: String
    gender: String
    ip_address: String
  }

  type Query {
    getUser(id: Int!): User
    getAllUsers: [User]
  }
`);

const root = {
    getUser: (args) => {
        const id = args.id;
        return users.find(user => user.id === id);
    },
    getAllUsers: () => {
        return users;
    }
};

const query = `
  query GetUser($userId: Int!) {
    getUser(id: $userId) {
      first_name
      last_name
      email
    }
  }
`;

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/graphql`);
});

// Run the query
const result = execute({
    schema: schema,
    document: parse(query),
    rootValue: root,
    variableValues: { userId: 1 }
});

console.log(result)