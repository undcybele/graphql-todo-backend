import express from "express";
import { graphqlHTTP } from "express-graphql";
import passport from "passport";
import DataLoader from "dataloader";

import { authSchema } from "./schema.js";
import { BasicStrategy } from "passport-http";
import { findUser } from "./db/users.js";

const loggingMiddleware = (req, _, next) => {
	console.log("ip:", req.ip);
	next();
};

passport.use(
	new BasicStrategy(function (username, password, cb) {
		const user = findUser(username, password);
		if (user) return cb(null, user);
		else return cb(null, false);
	})
);

let app = express();
app.use(loggingMiddleware);
app.use(
	"/graphql",
	passport.authenticate("basic", { session: false }),
	graphqlHTTP((req, res) => ({
		schema: authSchema,
		graphiql: true,
		context: {
			loggedUser: req.user,
		},
	}))
);
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
