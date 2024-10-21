import { toastAlert } from '$lib/utils/toasts';

export default class SurveyQuestion {
	private _id: number;
	private _group_id: number;
	private _question: string;
	private _options: string[];

	constructor(id: number, group_id: number, question: string, options: string[]) {
		this._id = id;
		this._group_id = group_id;
		this._question = question;
		this._options = options;
	}

	get id(): number {
		return this._id;
	}

	get group_id(): number {
		return this._group_id;
	}

	get question(): string {
		return this._question;
	}

	get options(): string[] {
		return this._options;
	}

	static parse(data: any): SurveyQuestion | null {
		if (data === null) {
			toastAlert('Failed to parse survey question data');
			return null;
		}

		const options = [];
		if (data.option1) options.push(data.option1);
		if (data.option2) options.push(data.option2);
		if (data.option3) options.push(data.option3);
		if (data.option4) options.push(data.option4);
		if (data.option5) options.push(data.option5);
		if (data.option6) options.push(data.option6);
		if (data.option7) options.push(data.option7);
		if (data.option8) options.push(data.option8);

		return new SurveyQuestion(data.id, data.group_id, data.question, options);
	}

	static parseAll(data: any): SurveyQuestion[] {
		if (data === null) {
			toastAlert('Failed to parse survey question data');
			return [];
		}

		const questions: SurveyQuestion[] = [];
		for (const question of data) {
			questions.push(SurveyQuestion.parse(question)!);
		}

		return questions;
	}
}
