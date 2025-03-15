import { createUserAPI, getUsersAPI, patchUserAPI } from '$lib/api/users';
import config from '$lib/config';
import { parseToLocalDate } from '$lib/utils/date';
import { toastAlert } from '$lib/utils/toasts';
import { sha256 } from 'js-sha256';
import { get, writable, type Writable } from 'svelte/store';
import Session from './session';

const { subscribe, set, update } = writable<User[]>([]);

export const users = {
	subscribe,
	set,
	update,
	reload: () => update((users) => users),
	add: (user: User) => update((users) => [...users, user]),
	delete: (id: number) => update((users) => users.filter((user) => user.id !== id)),
	search: (email: string) => get(users).find((user) => user.email.includes(email)),
	fetch: async () => User.parseAll(await getUsersAPI(fetch))
};

export default class User {
	private _id: number;
	private _email: string;
	private _nickname: string;
	private _type: number;
	private _is_active: boolean;
	private _ui_language: string | null;
	private _home_language: string | null;
	private _target_language: string | null;
	private _birthdate: Date | null;
	private _gender: string | null;
	private _bio: string | null;
	private _calcom_link: string | null;
	private _study_id: number | null;
	private _last_survey: Date | null;
	private _tutor_list: string[];
	private _my_tutor: string | null;
	private _ws_connected: boolean = false;
	private _ws: WebSocket | null = null;
	private _sessions_added: Writable<Session[]> = writable([]);
	private _availabilities: { day: string; start: string; end: string }[];
	private _my_slots: { day: string; start: string; end: string }[];

	private constructor(
		id: number,
		email: string,
		nickname: string,
		type: number,
		is_active: boolean,
		ui_language: string | null,
		home_language: string | null,
		target_language: string | null,
		birthdate: Date | null,
		gender: string | null,
		calcom_link: string | null,
		study_id: number | null,
		last_survey: Date | null,
		tutor_list: string[] = [],
		my_tutor: string | null = null,
		bio: string | null = null,
		availabilities: { day: string; start: string; end: string }[] = [],
		my_slots: { day: string; start: string; end: string }[] = []
	) {
		this._id = id;
		this._email = email;
		this._nickname = nickname;
		this._type = type;
		this._is_active = is_active;
		this._ui_language = ui_language;
		this._home_language = home_language;
		this._target_language = target_language;
		this._birthdate = birthdate;
		this._gender = gender;
		this._calcom_link = calcom_link;
		this._study_id = study_id;
		this._last_survey = last_survey;
		this._tutor_list = tutor_list;
		this._my_tutor = my_tutor;
		this._bio = bio;
		this._availabilities = availabilities;
		this._my_slots = my_slots;
	}

	get id(): number {
		return this._id;
	}

	get email(): string {
		return this._email;
	}

	get emailHash(): string {
		return sha256(this._email.toLowerCase());
	}

	get nickname(): string {
		return this._nickname;
	}

	get type(): number {
		return this._type;
	}

	get bio(): string | null {
		return this._bio;
	}

	get is_active(): boolean {
		return this._is_active;
	}

	get is_admin(): boolean {
		return this._type === 0;
	}

	get is_tutor(): boolean {
		return this._type === 1;
	}

	get ui_language(): string | null {
		return this._ui_language;
	}

	get home_language(): string | null {
		return this._home_language;
	}

	get target_language(): string | null {
		return this._target_language;
	}

	get birthdate(): Date | null {
		return this._birthdate;
	}

	get gender(): string | null {
		return this._gender;
	}

	get calcom_link(): string | null {
		return this._calcom_link;
	}

	get study_id(): number | null {
		return this._study_id;
	}

	get last_survey(): Date | null {
		return this._last_survey;
	}

	get sessions_added(): Writable<Session[]> {
		return this._sessions_added;
	}

	get my_tutor(): string | null {
		return this._my_tutor;
	}

	get tutor_list(): string[] {
		return this._tutor_list;
	}

	get availabilities(): {
		avaibility: number; day: string; start: string; end: string 
}[] {
		return this._availabilities;
	}

	set availabilities(value: { day: string; start: string; end: string }[]) {
		this._availabilities = value;
	}

	get my_slots(): { day: string; start: string; end: string }[] {
		return this._my_slots;
	}

	set my_slots(value: { day: string; start: string; end: string }[]) {
		this._my_slots = value;
	}

	set tutor_list(value: string[]) {
		this._tutor_list = value;
	}

	equals<T>(obj: T): boolean {
		if (obj === null || obj === undefined) return false;
		if (!(obj instanceof User)) return false;
		const user = obj as User;

		return this._id === user._id;
	}

	async setAvailability(availability: bigint, calcom_link: string): Promise<boolean> {
		return await patchUserAPI(fetch, this.id, {
			availability: availability.toString(),
			calcom_link: calcom_link
		});
	}

	notEquals<T>(obj: T): boolean {
		return !this.equals(obj);
	}

	toJson(): string {
		return JSON.stringify({
			id: this.id,
			email: this.email,
			nickname: this.nickname,
			type: this.type,
			is_active: this.is_active,
			ui_language: this.ui_language,
			home_language: this.home_language,
			target_language: this.target_language,
			birthdate: this.birthdate,
			gender: this.gender,
			calcom_link: this.calcom_link,
			study_id: this.study_id,
			last_survey: this.last_survey,
			tutor_list: this._tutor_list,
			my_tutor: this.my_tutor,
			bio: this.bio,
			availabilities: this._availabilities,
			my_slots: this._my_slots
		});
	}

	async patch(data: any): Promise<boolean> {
		const res = await patchUserAPI(fetch, this.id, data);
		if (res) {
			if (data.email) this._email = data.email;
			if (data.nickname) this._nickname = data.nickname;
			if (data.type) this._type = data.type;
			if (data.is_active) this._is_active = data.is_active;
			if (data.ui_language) this._ui_language = data.ui_language;
			if (data.home_language) this._home_language = data.home_language;
			if (data.target_language) this._target_language = data.target_language;
			if (data.birthdate) this._birthdate = data.birthdate;
			if (data.gender) this._gender = data.gender;
			if (data.calcum_link) this._calcom_link = data.calcom_link;
			if (data.study_id) this._study_id = data.study_id;
			if (data.last_survey) this._last_survey = data.last_survey;
			if (data.tutor_list) this._tutor_list = data.tutor_list;
			if (data.my_tutor) this._my_tutor = data.my_tutor;
			if (data.bio) this._bio = data.bio;
			if (data.availabilities) this._availabilities = data.availabilities;
			if (data.my_slots) this._my_slots = data.my_slots;
		}
		return res;
	}

	static find(user_id: number): User | undefined {
		return get(users).find((user) => user.id === user_id);
	}

	static async create(
		nickname: string,
		email: string,
		password: string,
		type: number,
		is_active: boolean
	): Promise<User | null> {
		const id = await createUserAPI(fetch, nickname, email, password, type, is_active);
		if (id == null) return null;

		const user = new User(
			id,
			email,
			nickname,
			type,
			is_active,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			[],
			null,
			null,
			[],
			[]
		);
		users.add(user);
		return user;
	}

	static parseFromServer(data: any): User | null {
		const userStr = data.user;
		if (userStr == null) return null;

		const userObject = JSON.parse(userStr);
		if (userObject == null) return null;

		const userFinal = User.parse(userObject);
		if (userFinal == null || userFinal.id == null || userFinal.id == undefined) return null;

		return userFinal;
	}

	public wsConnect(jwt: string) {
		if (this._ws_connected) return;

		this._ws = new WebSocket(`${config.WS_URL}/global?token=${jwt}`);

		this._ws.onopen = () => {
			this._ws_connected = true;
		};

		this._ws.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (data['type'] === 'session') {
				if (data['action'] === 'create') {
					const session = Session.parse(data['data']);
					if (session) {
						this._sessions_added.update((sessions) => {
							if (!sessions.find((s) => s.id === session.id)) {
								return [...sessions, session];
							}
							return sessions.map((s) => (s.id === session.id ? session : s));
						});

						return;
					}
				}
			}
			console.error('Failed to parse ws:', data);
		};

		this._ws.onclose = () => {
			this._ws = null;
			this._ws_connected = false;
			setTimeout(() => this.wsConnect(jwt), 1000);
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static parse(json: any): User {
		if (json === null || json === undefined) {
			toastAlert('Failed to parse user: json is null');
			return json;
		}

		const user = new User(
			json.id,
			json.email,
			json.nickname,
			json.type,
			json.is_active,
			json.ui_language,
			json.home_language,
			json.target_language,
			json.birthdate,
			json.gender,
			json.calcom_link,
			json.study_id,
			json.last_survey === null ? null : parseToLocalDate(json.last_survey),
			json.tutor_list || [],
			json.my_tutor,
			json.bio,
			json.availabilities || [],
			json.my_slots || []
		);

		users.update((us) => {
			if (!us.find((u) => u.id === user.id)) {
				return [...us, user];
			}

			return us.map((u) => (u.id === user.id ? user : u));
		});

		return user;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static parseAll(json: any): User[] {
		if (json === null || json === undefined) {
			toastAlert('Failed to parse users: json is null');
			return json;
		}

		const us: User[] = [];

		for (const user of json) {
			us.push(User.parse(user));
		}

		return us;
	}
}
