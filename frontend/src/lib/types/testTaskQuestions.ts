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

		return null;
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

	static parseAll(data: any): TestTaskQuestionQcm[] {
		if (data === null) {
			return [];
		}
		return data
			.map((question: any) => TestTaskQuestionQcm.parse(question))
			.filter(
				(question: TestTaskQuestionQcm | null): question is TestTaskQuestionQcm => question !== null
			);
	}
}
