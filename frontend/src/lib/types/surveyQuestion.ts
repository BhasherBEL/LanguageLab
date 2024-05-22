import { toastAlert } from '$lib/utils/toasts';
import SurveyOption from './surveyOption';

export default class SurveyQuestion {
	private _id: number;
	private _group_id: number;
	private _title: string;
	private _question_type: string;
	private _question_value: string;
	private options: SurveyOption[];

	constructor(
		id: number,
		group_id: number,
		title: string,
		question_type: string,
		question_value: string,
		options: SurveyOption[]
	) {
		this._id = id;
		this._group_id = group_id;
		this._title = title;
		this._question_type = question_type;
		this._question_value = question_value;
		this.options = options;
	}

	get id(): number {
		return this._id;
	}

	get group_id(): number {
		return this._group_id;
	}

	get title(): string {
		return this._title;
	}

	get question_type(): string {
		return this._question_type;
	}

	get question_value(): string {
		return this._question_value;
	}

	static parse(data: any): SurveyQuestion | null {
		if (data === null) {
			toastAlert('Failed to parse survey question data');
			return null;
		}

		const options = SurveyOption.parseAll(data.options);

		return new SurveyQuestion(
			data.id,
			data.group_id,
			data.title,
			data.question_type,
			data.question_value,
			options
		);
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
