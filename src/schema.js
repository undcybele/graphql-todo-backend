import { makeExecutableSchema } from "@graphql-tools/schema";
import { authDirectiveTransformer, authDirectiveTypeDefs } from "./auth.js";
import DataLoader from "dataloader";

import { userDB, User } from "./db/users.js";
import { tempDB, Task } from "./db/tasks.js";

let id_count = tempDB.length - 1;

const typeDefs = `
  type User @auth(requires: ADMIN) {
    id: ID!
    username: String!
    password: String!
    role: [Role]!
    tasks: [Task]!
  }

  type Task {
    id: ID!
    text: String!
    isDone: Boolean!
    owner: ID!
  }
  
  input TaskInput {
    text: String!
  }

  type Query {
    getTaskById(id: ID!): Task 
    getAllTasks: [Task] @auth(requires: ADMIN)
    getUserById(id: ID!): User
  }

  type Mutation {
    createTask(input: TaskInput): Task
    setAsDone(id: ID!): Task
  }
`;

const batchGetTodosById = async (ids) => {
	const results = ids
		.map((id) => tempDB[id])
		.reduce((acc, value) => {
			acc[value.id] = value;
			return acc;
		}, {});
	return ids.map((id) => results[id] || new Error(`No results for ${id}`));
};

const taskLoader = new DataLoader(batchGetTodosById);

const resolvers = {
	Query: {
		getAllTasks: () => {
			if (!tempDB) {
				throw new Error("No tasks available. Create a new one!");
			}
			return tempDB;
		},
		getUserById: (parent, args, context) => {
			return userDB.find((user) => user.id == args.id);
		},
	},
	User: {
		tasks: async (parent, args, context) => {
			return await taskLoader.loadMany(parent.tasks);
		},
	},
	Mutation: {
		createTask: (parent, args, context) => {
			let new_task = new Task(
				++id_count,
				args.input.text,
				false,
				context.loggedUser.id
			);
			tempDB[id_count] = new_task;
			return new_task;
		},
		setAsDone: (parent, args, context) => {
			let task = tempDB.find((tsk) => tsk.id == args.id);
			task.isDone = true;
			tempDB[args.id] = task;
			return new Task(args.id, task.text, task.isDone, context.loggedUser.id);
		},
	},
};

const schema = makeExecutableSchema({
	typeDefs: [authDirectiveTypeDefs, typeDefs],
	resolvers,
});

export const authSchema = authDirectiveTransformer(schema);
