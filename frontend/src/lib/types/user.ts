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
	search: (username: string) => get(users).find((user) => user.username.includes(username))
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

	static parse(json: any): User {
		if (json === null || json === undefined) {
			toastAlert('Failed to parse user: json is null');
			return json;
		}

		return new User(json.id, json.username, json.type, json.is_active);
	}

	static parseAll(json: any): User[] {
		if (json === null || json === undefined) {
			toastAlert('Failed to parse users: json is null');
			return json;
		}

		const users: User[] = [];

		for (const user of json) {
			users.push(User.parse(user));
		}

		return users;
	}
}
