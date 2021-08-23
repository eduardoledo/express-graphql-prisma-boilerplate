import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + '/../.env' });
import express from 'express';
import AuthMiddleware from "./middlewares/auth/auth.middleware";
import { generateMiddlewareGraphql } from "./middlewares/graphql-express/graphql-express.middleware";

const app = express();
const graphqlMiddleware = generateMiddlewareGraphql();

app.use(express.json({ limit: '501mb' }));
app.use('/graphql', [
    AuthMiddleware,
    graphqlMiddleware,
])

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port: ${process.env.PORT}`);
});

// GraphQL Schema
// Authorization
// Authentication
// Database
// Routing?

