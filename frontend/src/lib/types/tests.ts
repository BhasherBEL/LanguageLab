import { toastAlert } from '$lib/utils/toasts';
import TestTaskGroup from './testTaskGroups';

export abstract class Test {
	private _id: number;
	private _title: string;

	constructor(id: number, title: string) {
		this._id = id;
		this._title = title;
	}

	get id(): number {
		return this._id;
	}

	get title(): string {
		return this._title;
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
	private _groups: TestTaskGroup[];

	constructor(id: number, title: string, groups: TestTaskGroup[]) {
		super(id, title);
		this._groups = groups;
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

		return new TestTask(data.id, data.title, groups);
	}
}

export class TestTyping extends Test {
	private _text: string;
	private _duration: number;
	private _repeat: number;

	constructor(id: number, title: string, text: string, duration: number, repeat: number) {
		super(id, title);
		this._text = text;
		this._duration = duration;
		this._repeat = repeat;
	}

	get text(): string {
		return this._text;
	}

	get duration(): number {
		return this._duration;
	}

	get repeat(): number {
		return this._repeat;
	}

	static parse(data: any): TestTyping | null {
		if (data === null) {
			toastAlert('Failed to parse test data');
			return null;
		}
		return new TestTyping(
			data.id,
			data.title,
			data.test_typing.text,
			data.test_typing.duration,
			data.test_typing.repeat
		);
	}
}
