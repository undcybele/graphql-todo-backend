import { makeExecutableSchema } from "@graphql-tools/schema";
import { authDirectiveTransformer, authDirectiveTypeDefs } from "./auth.js";
import { userDB, User } from "./db/users.js";
import { tempDB, Task } from "./db/tasks.js";

let id_count = tempDB.length - 1;

const typeDefs = `
  type User @auth(requires: ADMIN) {
    id: ID
    username: String
    password: String
    role: [Role]
  }

  type Task {
    id: ID!
    text: String!
    isDone: Boolean!
    owner: ID!
  }

  type Query {
    getTaskById(id: ID!): Task 
    getAllTasks: [Task] @auth(requires: ADMIN)
  }

  input TaskInput {
    text: String!
  }

  type Mutation {
    createTask(input: TaskInput): Task
    setAsDone(id: ID!): Task
  }
`;

const resolvers = {
	Query: {
		getAllTasks: () => {
			if (!tempDB) {
				throw new Error("No tasks available. Create a new one!");
			}
			return tempDB;
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
