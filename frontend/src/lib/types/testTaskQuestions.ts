import { seededRandom, shuffleWithSeed } from '../utils/arrays.js';

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

	get type(): string {
		if (this instanceof TestTaskQuestionQcm) {
			return 'qcm';
		} else if (this instanceof TestTaskQuestionGapfill) {
			return 'gapfill';
		}
		return 'unknown';
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

export enum TestTaskQuestionQcmType {
	image = 'image',
	text = 'text',
	audio = 'audio',
	dropdown = 'dropdown',
	radio = 'radio'
}

export class TestTaskQuestionQcm extends TestTaskQuestion {
	private _options: string[];
	private _correct: number;

	constructor(id: number, question: string, options: string[], correct: number) {
		super(id, question);
		this._options = options;
		this._correct = correct;
	}

	get options(): { type: string; value: string }[] {
		return this._options.map((option) => {
			const type = option.split(':')[0];
			const value = option.split(':').slice(1).join(':');
			return { type, value };
		});
	}

	get optionsRandomized(): { type: string; value: string; index: number }[] {
		let options = this.options.map((option, index) => ({ ...option, index }));

		return shuffleWithSeed(options, this.id);
	}

	get correct(): number {
		return this._correct;
	}

	get subType(): TestTaskQuestionQcmType | null {
		switch (this.question.split(':')[0]) {
			case 'image':
				return TestTaskQuestionQcmType.image;
			case 'audio':
				return TestTaskQuestionQcmType.audio;
			case 'text':
				return TestTaskQuestionQcmType.text;
		}

		return null;
	}

	get value(): string {
		return this.question.split(':').slice(1).join(':');
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

	get parts(): { text: string; gap: string | null }[] {
		const gapText = this.question.split(':').slice(1).join(':');

		const parts: { text: string; gap: string | null }[] = [];

		for (let part of gapText.split(/(<.+?>)/g)) {
			const isGap = part.startsWith('<') && part.endsWith('>');
			const text = isGap ? part.slice(1, -1) : part;
			parts.push({ text: text, gap: isGap ? '' : null });
		}

		return parts;
	}

	get value(): string {
		return super.question.split(':').slice(1).join(':');
	}

	static parse(data: any): TestTaskQuestionGapfill | null {
		if (data === null) {
			return null;
		}
		return new TestTaskQuestionGapfill(data.id, data.question);
	}
}
