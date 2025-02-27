import { toastAlert } from '$lib/utils/toasts';
import TestTaskGroup from './testTaskGroups';

export abstract class Test {
	private _id: number;

	constructor(id: number) {
		this._id = id;
	}

	get id(): number {
		return this._id;
	}

	static parse(data: any): Test | null {
		if (data === null) {
			toastAlert('Failed to parse test data');
			return null;
		}

		if (data.test_task) {
			return TestTask.parse(data);
		}

		if (data.test_typing) {
			return TestTyping.parse(data);
		}

		return null;
	}

	static parseAll(data: any): Test[] {
		if (data === null) {
			toastAlert('Failed to parse test data');
			return [];
		}

		return data
			.map((test: any) => Test.parse(test))
			.filter((test: Test | null): test is Test => test !== null);
	}
}

export class TestTask extends Test {
	private _title: string;
	private _groups: TestTaskGroup[];

	constructor(id: number, title: string, groups: TestTaskGroup[]) {
		super(id);
		this._title = title;
		this._groups = groups;
	}

	get title(): string {
		return this._title;
	}

	get groups(): TestTaskGroup[] {
		return this._groups;
	}

	get numQuestions(): number {
		return this._groups.reduce((acc, group) => acc + group.questions.length, 0);
	}

	static parse(data: any): TestTask | null {
		if (data === null) {
			toastAlert('Failed to parse test data');
			return null;
		}

		const groups = TestTaskGroup.parseAll(data.test_task.groups);

		return new TestTask(data.id, data.test_task.title, groups);
	}

	static parseAll(data: any): TestTask[] {
		if (data === null) {
			toastAlert('Failed to parse test data');
			return [];
		}

		return data
			.map((test: any) => TestTask.parse(test))
			.filter((test: TestTask | null): test is TestTask => test !== null);
	}
}

export class TestTyping extends Test {}
