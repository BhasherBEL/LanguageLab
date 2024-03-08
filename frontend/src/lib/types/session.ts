import { toastAlert } from '$lib/utils/toasts';
import { writable } from 'svelte/store';
import User from './user';
import { axiosInstance } from '$lib/api/apiInstance';

const { subscribe, set, update } = writable<Session[]>([]);

export const sessions = {
	subscribe,
	set,
	update,
	reload: () => update((sessions) => sessions)
};

export default class Session {
	private _id: number;
	private _token: string;
	private _is_active: boolean;
	private _users: User[];

	private constructor(id: number, token: string, is_active: boolean, users: User[]) {
		this._id = id;
		this._token = token;
		this._is_active = is_active;
		this._users = users;
	}

	get id(): number {
		return this._id;
	}

	get token(): string {
		return this._token;
	}

	get is_active(): boolean {
		return this._is_active;
	}

	get users(): User[] {
		return this._users;
	}

	usersList(maxLength = 30): string {
		const users = this._users.map((user) => user.username).join(', ');
		if (users.length < maxLength) {
			return users;
		}
		return users.substring(0, maxLength) + '...';
	}

	static parse(json: any): Session {
		if (json === null || json === undefined) {
			toastAlert('Failed to parse session: json is null');
			return json;
		}

		const session = new Session(json.id, json.token, json.is_active, []);

		session._users = User.parseAll(json.users);

		sessions.update((sessions) => {
			if (!sessions.find((s) => s.id === session.id)) {
				return [...sessions, session];
			}
			return sessions.map((s) => (s.id === session.id ? session : s));
		});

		return session;
	}

	static parseAll(json: any): Session[] {
		if (json === null || json === undefined) {
			toastAlert('Failed to parse sessions: json is null');
			return json;
		}

		const sessions: Session[] = [];

		for (const session of json) {
			sessions.push(Session.parse(session));
		}

		return sessions;
	}

	static async create(): Promise<Session | null> {
		const response = await axiosInstance.post('/sessions');

		if (response.status !== 200) {
			toastAlert('Failed to create session');
			return null;
		}

		return Session.parse(response.data);
	}
}
