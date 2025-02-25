import {
	addUserToStudyAPI,
	createStudyAPI,
	deleteStudyAPI,
	patchStudyAPI,
	removeUserToStudyAPI
} from '$lib/api/studies';
import { parseToLocalDate } from '$lib/utils/date';
import { toastAlert } from '$lib/utils/toasts';
import type { fetchType } from '$lib/utils/types';
import User from './user';
import SurveyTypingSvelte from '$lib/types/surveyTyping.svelte';
import Survey from '$lib/types/survey';

export default class Study {
	private _id: number;
	private _title: string;
	private _description: string;
	private _startDate: Date;
	private _endDate: Date;
	private _nbSession: number;
	private _users: User[];
	private _consentParticipation: string;
	private _consentPrivacy: string;
	private _consentRights: string;
	private _consentStudyData: string;
	private _tests: (SurveyTypingSvelte | Survey)[];

	private constructor(
		id: number,
		title: string,
		description: string,
		startDate: Date,
		endDate: Date,
		nbSession: number,
		users: User[],
		consentParticipation: string,
		consentPrivacy: string,
		consentRights: string,
		consentStudyData: string,
		tests: (SurveyTypingSvelte | Survey)[]
	) {
		this._id = id;
		this._title = title;
		this._description = description;
		this._startDate = startDate;
		this._endDate = endDate;
		this._nbSession = nbSession;
		this._users = users;
		this._consentParticipation = consentParticipation;
		this._consentPrivacy = consentPrivacy;
		this._consentRights = consentRights;
		this._consentStudyData = consentStudyData;
		this._tests = tests;
	}

	get id(): number {
		return this._id;
	}

	get title(): string {
		return this._title;
	}

	set title(value: string) {
		this._title = value;
	}

	get description(): string {
		return this._description;
	}

	set description(value: string) {
		this._description = value;
	}

	get startDate(): Date {
		return this._startDate;
	}

	set startDate(value: Date) {
		this._startDate = value;
	}

	get endDate(): Date {
		return this._endDate;
	}

	set endDate(value: Date) {
		this._endDate = value;
	}

	get nbSession(): number {
		return this._nbSession;
	}

	set nbSession(value: number) {
		this._nbSession = value;
	}

	get users(): User[] {
		return this._users;
	}

	set users(value: User[]) {
		this._users = value;
	}

	get numberOfUsers(): number {
		return this._users.length;
	}

	get consentParticipation(): string {
		return this._consentParticipation;
	}

	set consentParticipation(value: string) {
		this._consentParticipation = value;
	}

	get consentPrivacy(): string {
		return this._consentPrivacy;
	}

	set consentPrivacy(value: string) {
		this._consentPrivacy = value;
	}

	get consentRights(): string {
		return this._consentRights;
	}

	set consentRights(value: string) {
		this._consentRights = value;
	}

	get consentStudyData(): string {
		return this._consentStudyData;
	}

	set consentStudyData(value: string) {
		this._consentStudyData = value;
	}

	get tests(): (SurveyTypingSvelte | Survey)[] {
		return this._tests;
	}

	set tests(value: (SurveyTypingSvelte | Survey)[]) {
		this._tests = value;
	}

	static async create(
		title: string,
		description: string,
		startDate: Date,
		endDate: Date,
		nbSession: number,
		consentParticipation: string,
		consentPrivacy: string,
		consentRights: string,
		consentStudyData: string,
		tests: (SurveyTypingSvelte | Survey)[],
		f: fetchType = fetch
	): Promise<Study | null> {
		const id = await createStudyAPI(
			f,
			title,
			description,
			startDate,
			endDate,
			nbSession,
			[],
			consentParticipation,
			consentPrivacy,
			consentRights,
			consentStudyData
		);

		if (id) {
			return new Study(
				id,
				title,
				description,
				startDate,
				endDate,
				nbSession,
				[],
				consentParticipation,
				consentPrivacy,
				consentRights,
				consentStudyData,
				tests
			);
		}
		return null;
	}

	async delete(f: fetchType = fetch): Promise<void> {
		await deleteStudyAPI(f, this._id);
	}

	async patch(data: any, f: fetchType = fetch): Promise<boolean> {
		const res = await patchStudyAPI(f, this._id, data);
		if (res) {
			if (data.title) this._title = data.title;
			if (data.description) this._description = data.description;
			if (data.start_date) this._startDate = parseToLocalDate(data.start_date);
			if (data.end_date) this._endDate = parseToLocalDate(data.end_date);
			if (data.chat_duration) this._nbSession = data.chat_duration;
			if (data.consent_participation) this._consentParticipation = data.consent_participation;
			if (data.consent_privacy) this._consentPrivacy = data.consent_privacy;
			if (data.consent_rights) this._consentRights = data.consent_rights;
			if (data.consent_study_data) this._consentStudyData = data.consent_study_data;
			if (data.tests) this._tests = data.tests;
			return true;
		}
		return false;
	}

	async removeUser(user: User, f: fetchType = fetch): Promise<boolean> {
		const res = await removeUserToStudyAPI(f, this._id, user.id);
		if (res) {
			this._users = this._users.filter((u) => u.id !== user.id);
		}

		return res;
	}

	async addUser(user: User, f: fetchType = fetch): Promise<boolean> {
		const res = await addUserToStudyAPI(f, this._id, user.id);
		if (res) {
			this._users.push(user);
		}

		return res;
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
			[],
			json.consent_participation,
			json.consent_privacy,
			json.consent_rights,
			json.consent_study_data,
			json.tests || []
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
