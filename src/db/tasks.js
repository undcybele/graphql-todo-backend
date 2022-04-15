export class Task {
	constructor(id, text, isDone, ownerId) {
		this.id = id;
		this.text = text;
		this.isDone = isDone;
		this.owner = ownerId;
	}
}

export let tempDB = [
	{
		id: 0,
		text: "Groceries shopping",
		isDone: true,
		owner: 0,
	},
	{
		id: 1,
		text: "Clean living room",
		isDone: false,
		owner: 1,
	},
	{
		id: 2,
		text: "Take trash out",
		isDone: false,
		owner: 0,
	},
	{
		id: 3,
		text: "Make the appointment",
		isDone: false,
		owner: 2,
	},
];
