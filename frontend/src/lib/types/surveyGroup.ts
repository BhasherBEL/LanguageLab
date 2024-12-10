import { toastAlert } from '$lib/utils/toasts';
import SurveyQuestion from './surveyQuestion';

export default class SurveyGroup {
	private _id: number;
	private _survey_id: number;
	private _title: string;
	private _demo: boolean;
	private _questions: SurveyQuestion[];

	constructor(
		id: number,
		survey_id: number,
		title: string,
		demo: boolean,
		questions: SurveyQuestion[]
	) {
		this._id = id;
		this._survey_id = survey_id;
		this._title = title;
		this._demo = demo;
		this._questions = questions;
	}

	get id(): number {
		return this._id;
	}

	get survey_id(): number {
		return this._survey_id;
	}

	get title(): string {
		return this._title;
	}

	get demo(): boolean {
		return this._demo;
	}

	get questions(): SurveyQuestion[] {
		return this._questions;
	}

	static parse(data: any): SurveyGroup | null {
		if (data === null) {
			toastAlert('Failed to parse survey group data');
			return null;
		}

		const questions = SurveyQuestion.parseAll(data.questions);

		return new SurveyGroup(data.id, data.survey_id, data.title, data.demo, questions);
	}

	static parseAll(data: any): SurveyGroup[] {
		if (data === null) {
			toastAlert('Failed to parse survey group data');
			return [];
		}

		const groups: SurveyGroup[] = [];
		for (const group of data) {
			groups.push(SurveyGroup.parse(group)!);
		}

		return groups;
	}
}
