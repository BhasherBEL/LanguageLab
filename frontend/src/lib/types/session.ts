import { toastAlert } from '$lib/utils/toasts';
import { get, writable, type Writable } from 'svelte/store';
import User from './user';
import { axiosInstance } from '$lib/api/apiInstance';
import { createMessageAPI, getMessagesAPI, patchLanguageAPI } from '$lib/api/sessions';
import Message from './message';
import config from '$lib/config';

const { subscribe, set, update } = writable<Session[]>([]);

export const sessions = {
	subscribe,
	set,
	update,
	reload: () => update((sessions) => sessions),
	add: (session: Session) => update((sessions) => [...sessions, session])
};

export default class Session {
	private _id: number;
	private _token: string;
	private _is_active: boolean;
	private _users: User[];
	private _messages: Writable<Message[]>;
	private _created_at: Date;
	private _start_time: Date;
	private _end_time: Date;
	private _language: string;
	private _ws: WebSocket | null = null;
	private _ws_connected = writable(false);

	private constructor(
		id: number,
		token: string,
		is_active: boolean,
		users: User[],
		created_at: Date,
		start_time: Date,
		end_time: Date,
		language: string
	) {
		this._id = id;
		this._token = token;
		this._is_active = is_active;
		this._users = users;
		this._messages = writable<Message[]>([]);
		this._created_at = created_at;
		this._start_time = start_time;
		this._end_time = end_time;
		this._language = language;
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

	get created_at(): Date {
		return this._created_at;
	}

	get start_time(): Date {
		return this._start_time;
	}

	get end_time(): Date {
		return this._end_time;
	}

	get language(): string {
		return this._language;
	}

	get messages(): Writable<Message[]> {
		return this._messages;
	}

	get wsConnected(): Writable<boolean> {
		return this._ws_connected;
	}

	usersList(maxLength = 30): string {
		const users = this._users.map((user) => user.nickname).join(', ');
		if (users.length < maxLength) {
			return users;
		}
		return users.substring(0, maxLength) + '...';
	}

	async delete(): Promise<boolean> {
		const response = await axiosInstance.delete(`/sessions/${this.id}`);

		if (response.status !== 204) {
			toastAlert('Failed to delete session');
			return false;
		}

		sessions.update((sessions) => sessions.filter((s) => s.id !== this.id));
		return true;
	}

	async toggleDisable(): Promise<boolean> {
		const response = await axiosInstance.patch(`/sessions/${this.id}`, {
			is_active: !this.is_active
		});

		if (response.status !== 204) {
			toastAlert('Failed to toggle activite session');
			return false;
		}

		this._is_active = !this.is_active;
		sessions.reload();
		return true;
	}

	async addUser(user: User): Promise<boolean> {
		const response = await axiosInstance.post(`/sessions/${this.id}/users/${user.id}`);

		if (response.status !== 201) {
			toastAlert('Failed to add user to session');
			return false;
		}

		this._users = [...this._users, user];

		sessions.reload();
		return true;
	}

	hasUser(user: User): boolean {
		return this._users.some((u) => u.equals(user));
	}

	async loadMessages(): Promise<boolean> {
		const messagesStr = await getMessagesAPI(this.id);

		this._messages.set(Message.parseAll(messagesStr));

		return true;
	}

	async sendMessage(
		sender: User,
		content: string,
		metadata: { message: string; date: number }[]
	): Promise<Message | null> {
		const id = await createMessageAPI(this.id, content, metadata);
		if (id == null) return null;

		const message = new Message(id, content, new Date(), sender, this);

		this._messages.update((messages) => {
			if (!messages.find((m) => m.id === message.id)) {
				return [...messages, message];
			}
			return messages.map((m) => (m.id === message.id ? message : m));
		});

		return message;
	}

	async changeLanguage(language: string): Promise<boolean> {
		const res = await patchLanguageAPI(this.id, language);
		if (!res) return false;
		this._language = language;
		return true;
	}

	public wsConnect(jwt: string) {
		if (get(this._ws_connected)) return;

		this._ws = new WebSocket(`${config.WS_URL}/sessions/${this.id}?token=${jwt}`);

		this._ws.onopen = () => {
			this._ws_connected.set(true);
			console.log('WS connected');
		};

		this._ws.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (data['type'] === 'message') {
				if (data['action'] === 'create') {
					const message = Message.parse(data['data']);
					if (message) {
						this._messages.update((messages) => {
							if (!messages.find((m) => m.id === message.id)) {
								return [...messages, message];
							}
							return messages.map((m) => (m.id === message.id ? message : m));
						});

						return;
					}
				}
			}
			console.error('Failed to parse ws:', data);
		};

		this._ws.onclose = () => {
			this._ws = null;
			this._ws_connected.set(false);
			console.log('WS closed, reconnecting in 1s');
			setTimeout(() => this.wsConnect(jwt), 1000);
		};
	}

	static find(id: number): Session | undefined {
		return get(sessions).find((session) => session.id === id);
	}

	async removeUser(user: User): Promise<boolean> {
		const response = await axiosInstance.delete(`/sessions/${this.id}/users/${user.id}`);

		if (response.status !== 204) {
			toastAlert('Failed to remove user from session');
			return false;
		}

		this._users = this._users.filter((u) => u.id !== user.id);

		sessions.reload();
		return true;
	}

	remainTime(): number {
		const now = new Date();
		return this._end_time.getTime() - now.getTime();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static parse(json: any): Session | null {
		if (json === null || json === undefined) {
			toastAlert('Failed to parse session: json is null');
			return null;
		}

		const session = new Session(
			json.id,
			json.token,
			json.is_active,
			[],
			new Date(json.created_at),
			new Date(json.start_time),
			new Date(json.end_time),
			json.language
		);

		session._users = User.parseAll(json.users);

		sessions.update((sessions) => {
			if (!sessions.find((s) => s.id === session.id)) {
				return [...sessions, session];
			}
			return sessions.map((s) => (s.id === session.id ? session : s));
		});

		return session;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static parseAll(json: any): Session[] {
		if (json === null || json === undefined) {
			toastAlert('Failed to parse sessions: json is null');
			return json;
		}

		const sessions: Session[] = [];

		for (const session of json) {
			const s = Session.parse(session);
			if (s) sessions.push(s);
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
