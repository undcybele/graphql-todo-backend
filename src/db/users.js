const Roles = { User: "USER", Admin: "ADMIN" };

export class User {
	constructor({ id, username, password, roles }) {
		this.id = id;
		this.username = username;
		this.password = password;
		this.roles = roles;
	}
}

export let userDB = [
	{
		id: 0,
		username: "User A",
		password: "Pass1",
		roles: [Roles.User],
		tasks: [0, 2],
	},
	{
		id: 1,
		username: "User B",
		password: "Pass2",
		roles: [Roles.User, Roles.Admin],
		tasks: [1],
	},
	{
		id: 2,
		username: "User C",
		password: "Pass3",
		roles: [Roles.User],
		tasks: [3],
	},
];

export function findUser(username, password) {
	return userDB.filter(
		(user) => user.username === username && user.password === password
	)?.[0];
}
