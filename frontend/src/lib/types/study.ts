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
import { Test } from './tests';

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
	private _tests: Test[];
	private _studyOrganisation: string;
	private _studyAddress: string;
	private _studyContact: string;
	private _studyPIemail: string;

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
		tests: Test[],
		studyOrganisation: string,
		studyAddress: string,
		studyContact: string,
		studyPIemail: string
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
		this._tests = tests;
		this._studyOrganisation = studyOrganisation;
		this._studyAddress = studyAddress;
		this._studyContact = studyContact;
		this._studyPIemail = studyPIemail;
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

	get tests(): Test[] {
		return this._tests;
	}

	set tests(value: Test[]) {
		this._tests = value;
	}

	get studyOrganisation(): string {
		return this._studyOrganisation;
	}

	set studyOrganisation(value: string) {
		this._studyOrganisation = value;
	}

	get studyAddress(): string {
		return this._studyAddress;
	}

	set studyAddress(value: string) {
		this._studyAddress = value;
	}

	get studyContact(): string {
		return this._studyContact;
	}

	set studyContact(value: string) {
		this._studyContact = value;
	}

	get studyPIemail(): string {
		return this._studyPIemail;
	}

	set studyPIemail(value: string) {
		this._studyPIemail = value;
	}

	/**
	 * Creates a new Study and saves it in the database.
	 * @async
	 * @returns a Study instance if successful, null otherwise
	 */
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
		tests: Test[],
		studyOrganisation: string,
		studyAddress: string,
		studyContact: string,
		studyPIemail: string,
		users: User[],
		f: fetchType = fetch
	): Promise<Study | null> {
		const id = await createStudyAPI(
			f,
			title,
			description,
			startDate,
			endDate,
			nbSession,
			tests.map((t) => t.id),
			consentParticipation,
			consentPrivacy,
			consentRights,
			studyOrganisation,
			studyAddress,
			studyContact,
			studyPIemail,
			users.map((u) => u.id)
		);

		if (id) {
			return new Study(
				id,
				title,
				description,
				startDate,
				endDate,
				nbSession,
				users,
				consentParticipation,
				consentPrivacy,
				consentRights,
				tests,
				studyOrganisation,
				studyAddress,
				studyContact,
				studyPIemail
			);
		}
		return null;
	}

	/**
	 * Delete this study from the database
	 * @async
	 */
	async delete(f: fetchType = fetch): Promise<void> {
		await deleteStudyAPI(f, this._id);
	}

	/**
	 * Update the study in the database with the new data.
	 * @async
	 * @param data  the updated fields
	 * @param f
	 * @return `true` if successful, `false` otherwise
	 */
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
			if (data.study_organisation) this._studyOrganisation = data.study_organisation;
			if (data.study_address) this._studyAddress = data.study_address;
			if (data.study_contact) this._studyContact = data.study_contact;
			if (data.study_pi_email) this._studyPIemail = data.study_pi_email;
			if (data.tests) this._tests = data.tests;
			return true;
		}
		return false;
	}

	/**
	 * Remove the given user from this study in the database, if successful update the user list of
	 * this study.
	 * @async
	 * @param user the user to remove
	 * @param f
	 * @return `true` if successful, `false` otherwise
	 */
	async removeUser(user: User, f: fetchType = fetch): Promise<boolean> {
		const res = await removeUserToStudyAPI(f, this._id, user.id);
		if (res) {
			this._users = this._users.filter((u) => u.id !== user.id);
		}

		return res;
	}

	/**
	 * Add the given user from this study in the database, if successful update the user list of this
	 * study.
	 * @async
	 * @param user the user to be added
	 * @param f
	 * @return `true` if successful, `false` otherwise
	 */
	async addUser(user: User, f: fetchType = fetch): Promise<boolean> {
		const res = await addUserToStudyAPI(f, this._id, user.id);
		if (res) {
			this._users.push(user);
		}

		return res;
	}

	/**
	 * Parses a JSON object into a Study instance.
	 *
	 * @param json the JSON object representing a study.
	 * @returns a Study instance if successful, `null` otherwise
	 */
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
			json.nb_session,
			[],
			json.consent_participation,
			json.consent_privacy,
			json.consent_rights,
			[],
			json.study_data_organisation,
			json.study_data_address,
			json.study_data_contact,
			json.study_data_email
		);

		study._users = User.parseAll(json.users);
		study._tests = Test.parseAll(json.tests);

		return study;
	}

	/**
	 * Parses an array of json into an array of Study instances.
	 *
	 * @param json an array of json representing studies
	 * @returns an array of Study instances. If parsing fails, returns an empty array.
	 */
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
