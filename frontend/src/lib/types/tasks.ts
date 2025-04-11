import { toastAlert } from '$lib/utils/toasts';

export default class Task {
	private _id: number;
	private _level: string;
	private _shortTitle: string;
	private _instructions: string;
	private _learnerInstructions: string;
	private _examples: string;

	constructor(
		id: number,
		level: string,
		shortTitle: string,
		instructions: string,
		learnerInstructions: string,
		examples: string
	) {
		this._id = id;
		this._level = level;
		this._shortTitle = shortTitle;
		this._instructions = instructions;
		this._learnerInstructions = learnerInstructions;
		this._examples = examples;
	}

	get id(): number {
		return this._id;
	}
	get level(): string {
		return this._level;
	}
	get shortTitle(): string {
		return this._shortTitle;
	}
	get instructions(): string {
		return this._instructions;
	}
	get learnerInstructions(): string {
		return this._learnerInstructions;
	}
	get examples(): string {
		return this._examples;
	}

	static parse(data: any): Task | null {
		if (data === null) {
			toastAlert('Failed to parse tasks data');
			return null;
		}

		return new Task(
			data.id,
			data.level,
			data.shortTitle,
			data.instructions,
			data.learnerInstructions,
			data.examples
		);
	}

	static parseAll(data: any): Task[] {
		if (data === null) {
			toastAlert('Failed to parse tasks data');
			return [];
		}
		return data
			.map((task: any) => Task.parse(task))
			.filter((task: Task | null): task is Task => task !== null);
	}
}
