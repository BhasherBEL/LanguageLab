import { createStudyAPI, deleteStudyAPI, patchStudyAPI } from '$lib/api/studies';
import { parseToLocalDate } from '$lib/utils/date';
import { toastAlert } from '$lib/utils/toasts';
import User from './user';

export default class Study {
	private _id: number;
	private _title: string;
	private _description: string;
	private _startDate: Date;
	private _endDate: Date;
	private _chatDuration: number;
	private _users: User[];

	private constructor(
		id: number,
		title: string,
		description: string,
		startDate: Date,
		endDate: Date,
		chatDuration: number,
		users: User[]
	) {
		this._id = id;
		this._title = title;
		this._description = description;
		this._startDate = startDate;
		this._endDate = endDate;
		this._chatDuration = chatDuration;
		this._users = users;
	}

	get id(): number {
		return this._id;
	}

	get title(): string {
		return this._title;
	}

	get description(): string {
		return this._description;
	}

	get startDate(): Date {
		return this._startDate;
	}

	get endDate(): Date {
		return this._endDate;
	}

	get chatDuration(): number {
		return this._chatDuration;
	}

	get users(): User[] {
		return this._users;
	}

	get numberOfUsers(): number {
		return this._users.length;
	}

	static async create(
		title: string,
		description: string,
		startDate: Date,
		endDate: Date,
		chatDuration: number
	): Promise<Study | null> {
		const id = await createStudyAPI(title, description, startDate, endDate, chatDuration);

		if (id) {
			return new Study(id, title, description, startDate, endDate, chatDuration, []);
		}
		return null;
	}

	async delete() {
		await deleteStudyAPI(this._id);
	}

	async patch(data: any): Promise<boolean> {
		const res = await patchStudyAPI(this._id, data);
		if (res) {
			if (data.title) this._title = data.title;
			if (data.description) this._description = data.description;
			if (data.start_date) this._startDate = data.start_date;
			if (data.end_date) this._endDate = data.end_date;
			if (data.chat_duration) this._chatDuration = data.chat_duration;
			return true;
		}
		return false;
	}

	static parse(json: any): Study | null {
		if (json === null || json === undefined) {
			toastAlert('Failed to parse study: json is null');
			return null;
		}

		const study = new Study(
			json.id,
			json.title,
			json.description,
			parseToLocalDate(json.start_date),
			parseToLocalDate(json.end_date),
			json.chat_duration,
			[]
		);

		study._users = User.parseAll(json.users);

		return study;
	}

	static parseAll(json: any): Study[] {
		if (json === null || json === undefined) {
			toastAlert('Failed to parse studies: json is null');
			return [];
		}
		const studies: Study[] = [];
		for (const studyJson of json) {
			const study = Study.parse(studyJson);
			if (study) {
				studies.push(study);
			}
		}
		return studies;
	}
}
