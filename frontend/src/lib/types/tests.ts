import { deleteTestAPI } from '$lib/api/tests';
import { toastAlert } from '$lib/utils/toasts';
import type { fetchType } from '$lib/utils/types';
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

	get type(): string {
		if (this instanceof TestTask) {
			return 'task';
		} else if (this instanceof TestTyping) {
			return 'typing';
		}
		return 'unknown';
	}

	async delete(f: fetchType = fetch): Promise<boolean> {
		return await deleteTestAPI(f, this._id);
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
	private _explanations: string;

	constructor(
		id: number,
		title: string,
		text: string,
		duration: number,
		repeat: number,
		explanations: string
	) {
		super(id, title);
		this._text = text;
		this._duration = duration;
		this._repeat = repeat;
		this._explanations = explanations;
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

	get explanations(): string {
		return this._explanations;
	}

	get initialDuration(): number {
		return this._duration > 0 ? this._duration : 0;
	}

	get durationDirection(): boolean {
		return this._duration > 0;
	}

	get durationStep(): number {
		return this.durationDirection ? -1 : 1;
	}

	get textRepeated(): string {
		if (this._repeat === 0) {
			return this._text.repeat(10 * this._duration);
		} else {
			return this._text.repeat(this._repeat);
		}
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
			data.test_typing.repeat,
			data.test_typing.explanations
		);
	}
}
