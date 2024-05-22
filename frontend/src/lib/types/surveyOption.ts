import { toastAlert } from '$lib/utils/toasts';

export default class SurveyOption {
	private _id: number;
	private _question_id: number;
	private _correct: boolean;
	private _type: string;
	private _value: string;

	constructor(id: number, question_id: number, correct: boolean, type: string, value: string) {
		this._id = id;
		this._question_id = question_id;
		this._correct = correct;
		this._type = type;
		this._value = value;
	}

	get id(): number {
		return this._id;
	}

	get question_id(): number {
		return this._question_id;
	}

	get correct(): boolean {
		return this._correct;
	}

	get type(): string {
		return this._type;
	}

	get value(): string {
		return this._value;
	}

	static parse(data: any): SurveyOption | null {
		if (data === null) {
			toastAlert('Failed to parse survey option data');
			return null;
		}

		return new SurveyOption(data.id, data.question_id, data.correct, data.type, data.value);
	}

	static parseAll(data: any): SurveyOption[] {
		if (data === null) {
			toastAlert('Failed to parse survey option data');
			return [];
		}

		const options: SurveyOption[] = [];
		for (const option of data) {
			options.push(SurveyOption.parse(option)!);
		}

		return options;
	}
}
