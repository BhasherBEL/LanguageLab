import { createUserAPI, getUsersAPI, patchUserAPI } from '$lib/api/users';
import { toastAlert } from '$lib/utils/toasts';
import { get, writable } from 'svelte/store';

const { subscribe, set, update } = writable<User[]>([]);

export const user = writable<User | null>(null);

export const users = {
	subscribe,
	set,
	update,
	reload: () => update((users) => users),
	add: (user: User) => update((users) => [...users, user]),
	delete: (id: number) => update((users) => users.filter((user) => user.id !== id)),
	search: (email: string) => get(users).find((user) => user.email.includes(email)),
	fetch: async () => User.parseAll(await getUsersAPI())
};

export default class User {
	private _id: number;
	private _email: string;
	private _nickname: string;
	private _type: number;
	private _availability: number;
	private _is_active: boolean;
	private _ui_language: string | null;
	private _home_language: string | null;
	private _target_language: string | null;
	private _birthdate: number | null;
	private _gender: string | null;
	private _calcom_link: string | null;

	private constructor(
		id: number,
		email: string,
		nickname: string,
		type: number,
		availability: number,
		is_active: boolean,
		ui_language: string | null,
		home_language: string | null,
		target_language: string | null,
		birthdate: number | null,
		gender: string | null,
		calcom_link: string | null
	) {
		this._id = id;
		this._email = email;
		this._nickname = nickname;
		this._type = type;
		this._availability = availability;
		this._is_active = is_active;
		this._ui_language = ui_language;
		this._home_language = home_language;
		this._target_language = target_language;
		this._birthdate = birthdate;
		this._gender = gender;
		this._calcom_link = calcom_link;
	}

	get id(): number {
		return this._id;
	}

	get email(): string {
		return this._email;
	}

	get nickname(): string {
		return this._nickname;
	}

	get type(): number {
		return this._type;
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

	get availability(): number {
		return this._availability;
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

	get birthdate(): number | null {
		return this._birthdate;
	}

	get gender(): string | null {
		return this._gender;
	}

	get calcom_link(): string | null {
		return this._calcom_link;
	}

	equals<T>(obj: T): boolean {
		if (obj === null || obj === undefined) return false;
		if (!(obj instanceof User)) return false;
		const user = obj as User;

		return this._id === user._id;
	}

	async setAvailability(availability: number, calcom_link: string): Promise<boolean> {
		return await patchUserAPI(this.id, { availability: availability, calcom_link: calcom_link });
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
			availability: this.availability,
			is_active: this.is_active,
			ui_language: this.ui_language,
			home_language: this.home_language,
			target_language: this.target_language,
			birthdate: this.birthdate,
			gender: this.gender,
			calcom_link: this.calcom_link
		});
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
		const id = await createUserAPI(nickname, email, password, type, is_active);
		if (id == null) return null;

		const user = new User(
			id,
			email,
			nickname,
			type,
			0,
			is_active,
			null,
			null,
			null,
			null,
			null,
			null
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

		user.set(userFinal);

		return userFinal;
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
			json.availability,
			json.is_active,
			json.ui_language,
			json.home_language,
			json.target_language,
			json.birthdate,
			json.gender,
			json.calcom_link
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
