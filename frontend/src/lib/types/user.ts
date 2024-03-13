import { getUsersAPI } from '$lib/api/users';
import { toastAlert } from '$lib/utils/toasts';
import { get, writable } from 'svelte/store';

const { subscribe, set, update } = writable<User[]>([]);

export const users = {
	subscribe,
	set,
	update,
	reload: () => update((users) => users),
	add: (user: User) => update((users) => [...users, user]),
	delete: (id: number) => update((users) => users.filter((user) => user.id !== id)),
	search: (username: string) => get(users).find((user) => user.username.includes(username)),
	fetch: async () => User.parseAll(await getUsersAPI())
};

export default class User {
	private _id: number;
	private _username: string;
	private _type: number;
	private _is_active: boolean;

	private constructor(id: number, username: string, type: number, is_active: boolean) {
		this._id = id;
		this._username = username;
		this._type = type;
		this._is_active = is_active;
	}

	get id(): number {
		return this._id;
	}

	get username(): string {
		return this._username;
	}

	get type(): number {
		return this._type;
	}

	get is_active(): boolean {
		return this._is_active;
	}

	equals<T>(obj: T): boolean {
		if (obj === null || obj === undefined) return false;
		if (!(obj instanceof User)) return false;
		const user = obj as User;

		return this.id === user.id;
	}

	static find(user_id: number): User | undefined {
		return get(users).find((user) => user.id === user_id);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static parse(json: any): User {
		if (json === null || json === undefined) {
			toastAlert('Failed to parse user: json is null');
			return json;
		}

		const user = new User(json.id, json.username, json.type, json.is_active);

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
