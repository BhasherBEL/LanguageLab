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

export class HumanUser {
	email: string;
	password?: string;
	type: number;
	bio: string | null;
	ui_language: string | null;
	home_language: string | null;
	target_language: string | null;
	birthdate: string | null;
	gender: string | null;
	calcom_link: string | null;
	last_survey: Date | null;
	availabilities: { day: string; start: string; end: string }[];
	tutor_list: string[];
	my_tutor: string | null;
	my_slots: { day: string; start: string; end: string }[];

	constructor(
		email: string,
		password: string | undefined,
		type: number,
		bio: string | null = null,
		ui_language: string | null = null,
		home_language: string | null = null,
		target_language: string | null = null,
		birthdate: string | null = null,
		gender: string | null = null,
		calcom_link: string | null = null,
		last_survey: Date | null = null,
		availabilities: { day: string; start: string; end: string }[] = [],
		tutor_list: string[] = [],
		my_tutor: string | null = null,
		my_slots: { day: string; start: string; end: string }[] = []
	) {
		this.email = email;
		this.password = password;
		this.type = type;
		this.bio = bio;
		this.ui_language = ui_language;
		this.home_language = home_language;
		this.target_language = target_language;
		this.birthdate = birthdate;
		this.gender = gender;
		this.calcom_link = calcom_link;
		this.last_survey = last_survey;
		this.availabilities = availabilities;
		this.tutor_list = tutor_list;
		this.my_tutor = my_tutor;
		this.my_slots = my_slots;
	}

	static parse(json: any): HumanUser | null {
		if (!json) return null;
		if (json.email === undefined || json.type === undefined) return null;

		return new HumanUser(
			json.email,
			json.password,
			json.type,
			json.bio || null,
			json.ui_language || null,
			json.home_language || null,
			json.target_language || null,
			json.birthdate || null,
			json.gender || null,
			json.calcom_link || null,
			json.last_survey === null ? null : parseToLocalDate(json.last_survey),
			json.availabilities || [],
			json.tutor_list || [],
			json.my_tutor || null,
			json.my_slots || []
		);
	}
}

export class AgentUser {
	model: string;
	system_prompt: string | null;
	is_in_pool: boolean;

	constructor(model: string, system_prompt: string | null = null, is_in_pool: boolean = false) {
		this.model = model;
		this.system_prompt = system_prompt;
		this.is_in_pool = is_in_pool;
	}

	static parse(json: any): AgentUser | null {
		if (!json) return null;
		if (json.model === undefined) return null;

		return new AgentUser(json.model, json.system_prompt || null, json.is_in_pool || false);
	}
}

export default class User {
	private _id: number;
	private _nickname: string;
	private _is_active: boolean;
	private _studies_id: number[];
	private _human_user: HumanUser | null;
	private _agent_user: AgentUser | null;
	private _ws_connected: boolean = false;
	private _ws: WebSocket | null = null;
	private _sessions_added: Writable<Session[]> = writable([]);

	private constructor(
		id: number,
		nickname: string,
		is_active: boolean,
		studies_id: number[] | null,
		human_user: HumanUser | null = null,
		agent_user: AgentUser | null = null
	) {
		this._id = id;
		this._nickname = nickname;
		this._is_active = is_active;
		this._studies_id = studies_id || [];
		this._human_user = human_user;
		this._agent_user = agent_user;
	}

	get id(): number {
		return this._id;
	}

	get email(): string {
		return this._human_user!.email;
	}

	get emailHash(): string {
		return sha256(this.email.toLowerCase());
	}

	get nickname(): string {
		return this._nickname;
	}

	get type(): number {
		return this._human_user!.type;
	}

	get bio(): string | null {
		return this._human_user?.bio || null;
	}

	get is_active(): boolean {
		return this._is_active;
	}

	get is_admin(): boolean {
		if (this._human_user === null) return false;
		return this.type === 0;
	}

	get is_tutor(): boolean {
		if (this._human_user === null) return false;
		return this.type === 1;
	}

	get is_human(): boolean {
		return this._human_user !== null;
	}

	get is_agent(): boolean {
		return this._agent_user !== null;
	}

	get ui_language(): string | null {
		return this._human_user?.ui_language || null;
	}

	get home_language(): string | null {
		return this._human_user?.home_language || null;
	}

	get target_language(): string | null {
		return this._human_user?.target_language || null;
	}

	get birthdate(): string | null {
		return this._human_user?.birthdate || null;
	}

	get birthdateAsDay(): string | null {
		if (this.birthdate) {
			return this.birthdate.slice(0, 4); // Format as YYYY-MM-DD
		}
		return null;
	}

	get gender(): string | null {
		return this._human_user?.gender || null;
	}

	get calcom_link(): string | null {
		return this._human_user?.calcom_link || null;
	}

	get studies_id(): number[] {
		return this._studies_id;
	}

	get last_survey(): Date | null {
		return this._human_user?.last_survey || null;
	}

	get sessions_added(): Writable<Session[]> {
		return this._sessions_added;
	}

	get my_tutor(): string | null {
		return this._human_user?.my_tutor || null;
	}

	get tutor_list(): string[] {
		return this._human_user?.tutor_list || [];
	}

	get availabilities(): { day: string; start: string; end: string }[] {
		return this._human_user?.availabilities || [];
	}

	set availabilities(value: { day: string; start: string; end: string }[]) {
		this._human_user!.availabilities = value;
	}

	get my_slots(): { day: string; start: string; end: string }[] {
		return this._human_user?.my_slots || [];
	}

	set my_slots(value: { day: string; start: string; end: string }[]) {
		this._human_user!.my_slots = value;
	}

	set tutor_list(value: string[]) {
		this._human_user!.tutor_list = value;
	}

	get human_user(): HumanUser | null {
		return this._human_user;
	}

	get agent_user(): AgentUser | null {
		return this._agent_user;
	}

	equals<T>(obj: T): boolean {
		if (obj === null || obj === undefined) return false;
		if (!(obj instanceof User)) return false;
		const user = obj as User;

		return this._id === user._id;
	}

	async setAvailability(availability: bigint, calcom_link: string): Promise<boolean> {
		return await patchUserAPI(fetch, this.id, {
			human_user: {
				availability: availability.toString(),
				calcom_link: calcom_link
			}
		});
	}

	notEquals<T>(obj: T): boolean {
		return !this.equals(obj);
	}

	toJson(): string {
		return JSON.stringify({
			id: this.id,
			nickname: this.nickname,
			is_active: this.is_active,
			studies_id: this.studies_id,
			human_user: this._human_user,
			agent_user: this._agent_user
		});
	}

	async patch(data: any): Promise<boolean> {
		const res = await patchUserAPI(fetch, this.id, data);
		if (res) {
			if (data.nickname) this._nickname = data.nickname;
			if (data.is_active !== undefined) this._is_active = data.is_active;
			if (data.studies_id) this._studies_id = data.studies_id;

			// Update human user fields
			if (data.human && this._human_user) {
				Object.assign(this._human_user, data.human);
			}

			// Update agent user fields
			if (data.agent && this._agent_user) {
				Object.assign(this._agent_user, data.agent);
			}
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

		const human_user = new HumanUser(
			email,
			password,
			type,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			[],
			[],
			null,
			[]
		);

		const user = new User(id, nickname, is_active, [], human_user, null);
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

		// Parse human_user if present
		let human_user: HumanUser | null = null;
		if (json.human_user) {
			human_user = HumanUser.parse(json.human_user);
		}

		// Create agent_user if it's an agent user
		let agent_user: AgentUser | null = null;
		if (json.agent_user) {
			agent_user = AgentUser.parse(json.agent_user);
		}

		const user = new User(
			json.id,
			json.nickname,
			json.is_active,
			json.studies_id,
			human_user,
			agent_user
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
