import { toastAlert } from '$lib/utils/toasts';
import SurveyGroup from './surveyGroup';

export default class Survey {
	private _id: number;
	private _title: string;
	private _groups: SurveyGroup[];

	constructor(id: number, title: string, groups: SurveyGroup[]) {
		this._id = id;
		this._title = title;
		this._groups = groups;
	}

	get id(): number {
		return this._id;
	}

	get title(): string {
		return this._title;
	}

	get groups(): SurveyGroup[] {
		return this._groups;
	}

	get nQuestions(): number {
		return this._groups.reduce((acc, group) => acc + group.questions.length, 0);
	}

	static parse(data: any): Survey | null {
		if (data === null) {
			toastAlert('Failed to parse survey data');
			return null;
		}

		const groups = SurveyGroup.parseAll(data.groups);

		return new Survey(data.id, data.title, groups);
	}

	static parseAll(data: any): Survey[] {
		if (data === null) {
			toastAlert('Failed to parse survey data');
			return [];
		}

		const surveys: Survey[] = [];
		for (const survey of data) {
			surveys.push(Survey.parse(survey)!);
		}

		return surveys;
	}
}
