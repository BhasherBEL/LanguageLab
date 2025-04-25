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

// some IDs not resolved because they are not used in the front-end
export class TaskStatus {
	private _id: number;
	private _task_id: number;
	private _student_id: number;
	private _tutor_id: number;
	private _session_id: number;
	private _status: string;

	constructor(
		id: number,
		task_id: number,
		student_id: number,
		tutor_id: number,
		session_id: number,
		status: string
	) {
		this._id = id;
		this._task_id = task_id;
		this._student_id = student_id;
		this._tutor_id = tutor_id;
		this._session_id = session_id;
		this._status = status;
	}

	get id(): number {
		return this._id;
	}

	get task_id(): number {
		return this._task_id;
	}

	get status(): string {
		return this._status;
	}

	get student_id(): number {
		return this.student_id;
	}

	get tutor_id(): number {
		return this.tutor_id;
	}

	get session_id(): number {
		return this.session_id;
	}

	static parse(data: any): TaskStatus | null {
		if (data === null) {
			toastAlert('Failed to parse task status data');
			return null;
		}

		return new TaskStatus(
			data.id,
			data.task_id,
			data.student_id,
			data.tutor_id,
			data.session_id,
			data.status
		);
	}

	static parseAll(data: any): TaskStatus[] {
		if (data === null) {
			toastAlert('Failed to parse task status data');
			return [];
		}
		return data
			.map((taskStatus: any) => TaskStatus.parse(taskStatus))
			.filter((taskStatus: TaskStatus | null): taskStatus is TaskStatus => taskStatus !== null);
	}
}
