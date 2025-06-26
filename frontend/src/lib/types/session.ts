import { toastAlert } from '$lib/utils/toasts';
import { get, writable, type Writable } from 'svelte/store';
import User from './user';
import {
	addUserToSessionAPI,
	createMessageAPI,
	createSessionAPI,
	createSessionSatisfyAPI,
	deleteSessionAPI,
	getMessagesAPI,
	patchLanguageAPI,
	patchSessionAPI,
	removeUserFromSessionAPI,
	sendPresenceAPI,
	sendTypingAPI
} from '$lib/api/sessions';
import Message from './message';
import config from '$lib/config';
import Feedback from './feedback';
import FeedbackReply from './feedbackReply';
import { parseToLocalDate } from '$lib/utils/date';
import { t } from '$lib/services/i18n';
import type { fetchType } from '$lib/utils/types';

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
	private _messages: Writable<(Message | Feedback)[]>;

	private _created_at: Date;
	private _start_time: Date;
	private _end_time: Date;
	private _language: string;
	private _ws: WebSocket | null = null;
	private _ws_connected = writable(false);
	private _lastTyping: Writable<Date | null> = writable(null);
	private _onlineUsers: Writable<Set<number>> = writable(new Set());
	private _onlineTimers: Map<number, number> = new Map();
	private _length: number;
	private _user: User | null = null;

	private constructor(
		id: number,
		token: string,
		is_active: boolean,
		users: User[],
		created_at: Date,
		start_time: Date,
		end_time: Date,
		language: string,
		length: number
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
		this._length = length;
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

	get messages(): Writable<(Message | Feedback)[]> {
		return this._messages;
	}

	get wsConnected(): Writable<boolean> {
		return this._ws_connected;
	}

	get lastTyping(): Writable<Date | null> {
		return this._lastTyping;
	}

	get onlineUsers(): Writable<Set<number>> {
		return this._onlineUsers;
	}

	get length(): number {
		return this._length;
	}

	get student(): User | null {
		return this._users.find((u) => u.type === 2) ?? null;
	}

	usersList(maxLength = 30): string {
		const users = this._users
			.filter((u) => u.id != this._user?.id)
			.map((user) => user.nickname)
			.join(', ');
		if (users.length < maxLength) {
			return users;
		}
		return users.substring(0, maxLength) + '...';
	}

	otherUsersList(maxLength = 30): string {
		const users = this._users
			.filter((u) => u.id != this._user?.id)
			.map((user) => user.nickname)
			.join(', ');
		if (users.length < maxLength) {
			return users;
		}
		return users.substring(0, maxLength) + '...';
	}

	async delete(): Promise<boolean> {
		const response = await deleteSessionAPI(fetch, this.id);
		if (!response) {
			toastAlert(get(t)('session.errors.delete'));
			return false;
		}

		sessions.update((sessions) => sessions.filter((s) => s.id !== this.id));
		return true;
	}

	async toggleDisable(): Promise<boolean> {
		const response = await patchSessionAPI(fetch, this.id, {
			is_active: !this.is_active
		});

		if (!response) {
			toastAlert(get(t)('session.errors.toggle'));
			return false;
		}

		this._is_active = !this.is_active;
		sessions.reload();
		return true;
	}

	async addUser(user: User): Promise<boolean> {
		const response = await addUserToSessionAPI(fetch, this.id, user.id);
		if (!response) {
			toastAlert(get(t)('session.errors.addUser'));
			return false;
		}

		this._users = [...this._users, user];

		sessions.reload();
		return true;
	}

	hasUser(user: User): boolean {
		return this._users.some((u) => u.equals(user));
	}

	async loadMessages(f: fetchType = fetch): Promise<boolean> {
		const messagesStr = await getMessagesAPI(f, this.id);

		this._messages.set(Message.parseAll(messagesStr));
		return true;
	}

	async sendMessage(
		sender: User,
		content: string,
		metadata: { message: string; date: number }[],
		replyTo: string | null
	): Promise<Message | null> {
		const json = await createMessageAPI(fetch, this.id, content, metadata, replyTo);
		if (json == null || json.id == null || json.message_id == null) {
			toastAlert('Failed to parse message');
			return null;
		}
		const message = new Message(
			json.id,
			json.message_id,
			content,
			new Date(),
			sender,
			this,
			json.reply_to
		);

		return message;
	}

	async sendTyping(): Promise<boolean> {
		const response = await sendTypingAPI(fetch, this.id);
		if (!response) {
			toastAlert(get(t)('session.errors.typing'));
			return false;
		}

		return true;
	}

	async sendPresence(): Promise<boolean> {
		const response = await sendPresenceAPI(fetch, this.id);
		if (!response) {
			toastAlert(get(t)('session.errors.presence'));
			return false;
		}

		return true;
	}

	async sendSatisfy(usefullness: number, easiness: number, remarks: string): Promise<boolean> {
		return await createSessionSatisfyAPI(fetch, this.id, usefullness, easiness, remarks);
	}

	async changeLanguage(language: string): Promise<boolean> {
		const res = await patchLanguageAPI(fetch, this.id, language);
		if (!res) return false;
		this._language = language;
		return true;
	}

	public wsConnect(jwt: string) {
		if (get(this._ws_connected)) return;

		this._ws = new WebSocket(`${config.WS_URL}/sessions/${this.id}?token=${jwt}`);

		this._ws.onopen = () => {
			this._ws_connected.set(true);
		};

		this._ws.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (data['type'] === 'message') {
				if (data['action'] === 'create') {
					const message = Message.parse(data['data']);
					if (message) {
						this._messages.update((messages) => {
							if (
								!messages.find((m) => m instanceof Message && m.message_id === message.message_id)
							) {
								return [...messages, message];
							}
							return messages.map((m) =>
								m instanceof Message && m.message_id === message.message_id ? message : m
							);
						});

						return;
					}
				} else if (data['action'] === 'update') {
					const message = Message.parse(data['data']);
					if (message) {
						if (get(this._messages).find((m) => m instanceof Message && m.id === message.id)) {
							this._messages.update((messages) => {
								const mEdited = messages.find((m) => m instanceof Message && m.id === message.id);
								if (!mEdited || !(mEdited instanceof Message)) return messages;
								mEdited.localUpdate(message.content, true);
								return messages.map((m) => (m.id === message.id ? mEdited : m));
							});
						} else {
							this._messages.update((messages) => {
								const mEdited = messages.find(
									(m) => m instanceof Message && m.message_id === message.message_id
								);
								if (!mEdited || !(mEdited instanceof Message)) return messages;
								mEdited.localUpdate(message.content);
								return messages.map((m) =>
									m instanceof Message && m.message_id === message.message_id ? mEdited : m
								);
							});

							return;
						}
					}
				} else if (data['action'] == 'typing') {
					this._lastTyping.set(new Date());
					return;
				} else if (data['action'] == 'feedback') {
					const message = get(this._messages).find(
						(m) => m instanceof Message && m.id === data['data']['message_id']
					);
					if (message && message instanceof Message) {
						const feedback = Feedback.parse(data['data'], message);
						if (feedback) {
							feedback.message.localFeedback(feedback);
							this._messages.update((ms) => [...ms, feedback]);
							return;
						}
					}
				} else if (data['action'] == 'deleteFeedback') {
					const message = get(this._messages).find(
						(m) => m instanceof Message && m.id === data['data']['message_id']
					);
					if (message && message instanceof Message) {
						message.deleteLocalFeedback(data['data']['feedback_id']);
						return;
					}
				} else if (data['action'] == 'createReply') {
					// Handle feedback reply creation
					console.log(
						'Processing createReply WebSocket message for feedback:',
						data['data']['feedback_id']
					);
					const message = get(this._messages).find(
						(m) => m instanceof Message && m.id === data['data']['message_id']
					);
					if (message && message instanceof Message) {
						const feedbacks = get(message.feedbacks);
						const feedback = feedbacks.find((f) => f.id === data['data']['feedback_id']);
						if (feedback) {
							const reply = FeedbackReply.parse(data['data'], feedback);
							if (reply) {
								feedback.localReply(reply);
								console.log('Reply added successfully via WebSocket');
								return;
							} else {
								console.error('Failed to parse reply from WebSocket');
							}
						} else {
							console.error('Feedback not found with id:', data['data']['feedback_id']);
						}
					} else {
						console.error('Message not found with id:', data['data']['message_id']);
					}
				} else if (data['action'] == 'updateReply') {
					// Handle feedback reply update
					const message = get(this._messages).find(
						(m) => m instanceof Message && m.id === data['data']['message_id']
					);
					if (message && message instanceof Message) {
						const feedback = get(message.feedbacks).find(
							(f) => f.id === data['data']['feedback_id']
						);
						if (feedback) {
							const replies = get(feedback.replies);
							const existingReply = replies.find((r) => r.id === data['data']['id']);
							if (existingReply) {
								existingReply.localUpdate(data['data']['content']);
								return;
							}
						}
					}
				} else if (data['action'] == 'deleteReply') {
					// Handle feedback reply deletion
					const message = get(this._messages).find(
						(m) => m instanceof Message && m.id === data['data']['message_id']
					);
					if (message && message instanceof Message) {
						const feedback = get(message.feedbacks).find(
							(f) => f.id === data['data']['feedback_id']
						);
						if (feedback) {
							feedback.deleteLocalReply(data['data']['reply_id']);
							return;
						}
					}
				}
			} else if (data['type'] === 'presence') {
				const user_id = data['data']['user'];
				if (data['action'] === 'online') {
					this._onlineUsers.update((users) => {
						users.add(user_id);

						return users;
					});
				} else if (data['action'] === 'offline') {
					this._onlineUsers.update((users) => {
						users.delete(user_id);
						return users;
					});
				}
				if (this._onlineTimers.has(user_id)) {
					clearTimeout(this._onlineTimers.get(user_id));
				}
				this._onlineTimers.set(
					user_id,
					setTimeout(() => {
						this._onlineUsers.update((users) => {
							users.delete(user_id);
							return users;
						});
					}, 30000) as unknown as number
				);

				return;
			}
			console.error('Failed to parse ws:', data);
		};

		this._ws.onclose = () => {
			this._ws = null;
			this._ws_connected.set(false);
			setTimeout(() => this.wsConnect(jwt), 1000);
		};
	}

	static find(id: number): Session | undefined {
		return get(sessions).find((session) => session.id === id);
	}

	async removeUser(user: User): Promise<boolean> {
		const response = await removeUserFromSessionAPI(fetch, this.id, user.id);
		if (!response) {
			toastAlert(get(t)('session.errors.removeUser'));
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
			parseToLocalDate(json.created_at),
			parseToLocalDate(json.start_time),
			parseToLocalDate(json.end_time),
			json.language,
			json.length
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
		const response = await createSessionAPI(fetch);
		if (!response) {
			toastAlert(get(t)('session.errors.create'));
			return null;
		}

		return Session.parse(response);
	}
}
