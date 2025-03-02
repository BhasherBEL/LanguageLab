import { toastAlert } from '$lib/utils/toasts';
import { TestTaskQuestion } from './testTaskQuestions';

export default class TestTaskGroup {
	private _id: number;
	private _title: string;
	private _demo: boolean;
	private _randomize: boolean;
	private _questions: TestTaskQuestion[];

	constructor(
		id: number,
		title: string,
		demo: boolean,
		randomize: boolean,
		questions: TestTaskQuestion[]
	) {
		this._id = id;
		this._title = title;
		this._demo = demo;
		this._randomize = randomize;
		this._questions = questions;
	}

	get id(): number {
		return this._id;
	}

	get title(): string {
		return this._title;
	}

	get demo(): boolean {
		return this._demo;
	}

	get randomize(): boolean {
		return this._randomize;
	}

	get questions(): TestTaskQuestion[] {
		return this._questions;
	}

	static parse(data: any): TestTaskGroup | null {
		if (data === null) {
			toastAlert('Failed to parse test task group data');
			return null;
		}
		const questions = TestTaskQuestion.parseAll(data.questions);
		return new TestTaskGroup(data.id, data.title, data.demo, data.randomize, questions);
	}

	static parseAll(data: any): TestTaskGroup[] {
		if (data === null) {
			toastAlert('Failed to parse test task group data');
			return [];
		}

		return data
			.map((group: any) => TestTaskGroup.parse(group))
			.filter((group: TestTaskGroup | null): group is TestTaskGroup => group !== null);
	}
}
