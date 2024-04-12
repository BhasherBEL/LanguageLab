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

	private constructor(
		id: number,
		email: string,
		nickname: string,
		type: number,
		availability: number,
		is_active: boolean
	) {
		this._id = id;
		this._email = email;
		this._nickname = nickname;
		this._type = type;
		this._availability = availability;
		this._is_active = is_active;
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
		return this._type <= 1;
	}

	get availability(): number {
		return this._availability;
	}

	equals<T>(obj: T): boolean {
		if (obj === null || obj === undefined) return false;
		if (!(obj instanceof User)) return false;
		const user = obj as User;

		return this.id === user.id;
	}

	async setAvailability(availability: number): Promise<boolean> {
		return await patchUserAPI(this.id, { availability: availability });
	}

	toJson(): string {
		return JSON.stringify({
			id: this.id,
			email: this.email,
			nickname: this.nickname,
			type: this.type,
			availability: this.availability,
			is_active: this.is_active
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

		const user = new User(id, email, nickname, type, 0, is_active);
		users.add(user);
		return user;
	}

	static parseFromServer(data: any): User | null {
		const userStr = data.user;
		console.log('userStr', userStr);
		if (userStr == null) return null;

		const userObject = JSON.parse(userStr);
		if (userObject == null) return null;

		const userFinal = User.parse(userObject);
		if (userFinal == null || userFinal.id == null || userFinal.id == undefined) return null;

		user.set(userFinal);
		console.log('userFinal', userFinal);

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
			json.is_active
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
