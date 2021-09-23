import { ApolloServer } from "apollo-server-micro";
import { typeDefs } from "./schemas/index";
import { resolvers } from './resolvers/index'
import Cors from 'cors';

function initMiddleware(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(result)
      })
    })
}

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'POST', 'OPTIONS'],
  })
)
let apolloServer;
let started = false;

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function graphql(req, res) {
  if (!started) {
    apolloServer = new ApolloServer({ typeDefs, resolvers });
    await cors(req, res)
    await apolloServer.start();
  }
  return apolloServer.createHandler({ path: "/api/graphql" })(req, res);
}
