export abstract class TestTaskQuestion {
	private _id: number;
	private _question: string;

	constructor(id: number, question: string) {
		this._id = id;
		this._question = question;
	}

	get id(): number {
		return this._id;
	}

	get question(): string {
		return this._question;
	}

	static parse(data: any): TestTaskQuestion | null {
		if (data === null) {
			return null;
		}

		if (data.question_qcm) {
			return TestTaskQuestionQcm.parse(data);
		}
		return TestTaskQuestionGapfill.parse(data);
	}

	static parseAll(data: any): TestTaskQuestion[] {
		if (data === null) {
			return [];
		}
		return data
			.map((question: any) => TestTaskQuestion.parse(question))
			.filter(
				(question: TestTaskQuestion | null): question is TestTaskQuestion => question !== null
			);
	}
}

export class TestTaskQuestionQcm extends TestTaskQuestion {
	private _options: string[];
	private _correct: number;

	constructor(id: number, question: string, options: string[], correct: number) {
		super(id, question);
		this._options = options;
		this._correct = correct;
	}

	get options(): string[] {
		return this._options;
	}

	get correct(): number {
		return this._correct;
	}

	static parse(data: any): TestTaskQuestionQcm | null {
		if (data === null) {
			return null;
		}

		return new TestTaskQuestionQcm(
			data.id,
			data.question,
			data.question_qcm.options,
			data.question_qcm.correct
		);
	}
}

export class TestTaskQuestionGapfill extends TestTaskQuestion {
	get answer(): string {
		const match = super.question.match(/<([^>]+)>/);
		return match ? match[1] : '';
	}

	get length(): number {
		return this.answer.length;
	}

	get blank(): string {
		const question = super.question;
		const match = question.match(/<([^>]+)>/);
		if (!match) return question;
		return question.replace(/<[^>]+>/, '_'.repeat(this.length));
	}

	static parse(data: any): TestTaskQuestionGapfill | null {
		if (data === null) {
			return null;
		}
		return new TestTaskQuestionGapfill(data.id, data.question);
	}
}
