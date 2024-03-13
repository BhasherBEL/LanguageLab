import Session from './session';
import User from './user';
import { toastAlert } from '$lib/utils/toasts';

export default class Message {
	private _id: number;
	private _content: string;
	private _created_at: string;
	private _user: User;
	private _session: Session;

	public constructor(
		id: number,
		content: string,
		created_at: string,
		user: User,
		session: Session
	) {
		this._id = id;
		this._content = content;
		this._created_at = created_at;
		this._user = user;
		this._session = session;
	}

	get id(): number {
		return this._id;
	}

	get content(): string {
		return this._content;
	}

	get created_at(): string {
		return this._created_at;
	}

	get user(): User {
		return this._user;
	}

	get session(): Session {
		return this._session;
	}

	static parse(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		json: any,
		user: User | null | undefined = null,
		session: Session | null | undefined = null
	): Message | null {
		if (json == null || json == undefined) {
			toastAlert('Failed to parse message: json is null');
			return null;
		}

		if (user == null || user == undefined) {
			user = User.find(json.user_id);
			if (user == null) {
				toastAlert('Failed to parse message: user not found');
				return null;
			}
		}

		if (session == null || session == undefined) {
			session = Session.find(json.session_id);
			if (session == null) {
				toastAlert('Failed to parse message: session not found');
				return null;
			}
		}

		const message = new Message(json.id, json.content, json.created_at, user, session);

		return message;
	}

	static parseAll(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		json: any,
		user: User | null | undefined = null,
		session: Session | null | undefined = null
	): Message[] {
		if (json == null || json == undefined) {
			toastAlert('Failed to parse messages: json is null');
			return [];
		}

		const messages: Message[] = [];

		for (const message of json) {
			const m = Message.parse(message, user, session);
			if (m) messages.push(m);
		}

		return messages;
	}
}
