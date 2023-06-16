import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
require('dotenv').config();

console.log(process.env.MONGO_URI, "this");

const client = new MongoClient(
  process.env.MONGO_URI || 'mongodb://localhost:27017',
);

const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
  }
  type Query {
    getUser(id: ID!): User
    users: [User]
  }
  type Mutation {
    setUser(name: String!, email: String!): User,
  }
`

const resolvers = {
  Query: {
    getUser: async (_: any, args: any) => {
      await client.connect();
      const user = await client
        .db('test')
        .collection('users')
        .find({ id: args.id })
        .toArray();

      return user.pop();
    },
    users: async () => {
      await client.connect();
      const users = await client
        .db('test')
        .collection('users')
        .find()
        .toArray();

      return users;
    },
  },
  Mutation: {
    setUser: async (_: any, args: any) => {
      await client.connect();
      const { insertedId } = await client
        .db('test')
        .collection('users')
        .insertOne({
          id: new ObjectId(),
          name: args.name,
          email: args.email
        });

      const user = await client
        .db('test')
        .collection('users')
        .find({ _id: insertedId })
        .toArray();

      return user.pop();
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(process.env.MONGO_URI, "this")
});
