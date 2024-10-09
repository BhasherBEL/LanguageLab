import Session from './session';
import User from './user';
import { updateMessageAPI, createMessageFeedbackAPI } from '$lib/api/sessions';
import { toastAlert } from '$lib/utils/toasts';
import { get, writable, type Writable } from 'svelte/store';
import Feedback from './feedback';
import { parseToLocalDate } from '$lib/utils/date';

export default class Message {
	private _id: number;
	private _message_id: string;
	private _content: string;
	private _created_at: Date;
	private _user: User;
	private _session: Session;
	private _edited: boolean = false;
	private _versions = writable([] as { content: string; date: Date }[]);
	private _feedbacks = writable([] as Feedback[]);

	public constructor(
		id: number,
		message_id: string,
		content: string,
		created_at: Date,
		user: User,
		session: Session
	) {
		this._id = id;
		this._message_id = message_id;
		this._content = content;
		this._created_at = created_at;
		this._user = user;
		this._session = session;
		this._versions.set([{ content: content, date: created_at }]);
	}

	get id(): number {
		return this._id;
	}

	get message_id(): string {
		return this._message_id;
	}

	get content(): string {
		return this._content;
	}

	get created_at(): Date {
		return this._created_at;
	}

	get user(): User {
		return this._user;
	}

	get session(): Session {
		return this._session;
	}

	get edited(): boolean {
		return this._edited;
	}

	get versions(): Writable<{ content: string; date: Date }[]> {
		return this._versions;
	}

	get feedbacks(): Writable<Feedback[]> {
		return this._feedbacks;
	}

	async update(content: string, metadata: { message: string; date: number }[]): Promise<boolean> {
		const response = await updateMessageAPI(this._session.id, this._message_id, content, metadata);
		if (response == null || response.id == null) return false;

		this._versions.update((v) => [...v, { content: content, date: new Date() }]);
		this._content = content;
		this._edited = true;
		this.feedbacks.set([]);

		return true;
	}

	async localUpdate(content: string, force: boolean = false): Promise<boolean> {
		this._content = content;
		this.feedbacks.set([]);
		if (!force) this._edited = true;

		return true;
	}

	async addFeedback(start: number, end: number, content: string | null = null): Promise<boolean> {
		const response = await createMessageFeedbackAPI(
			this._session.id,
			this._id,
			start,
			end,
			content
		);
		if (response == -1) return false;

		const feedback = new Feedback(response, this, start, end, content);
		this.localFeedback(feedback);
		return true;
	}

	localFeedback(feedback: Feedback): void {
		this._feedbacks.update((f) => {
			if (!f.find((fb) => fb.id == feedback.id)) return [...f, feedback];
			return f.map((fb) => (fb.id == feedback.id ? feedback : fb));
		});
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

		const message = new Message(
			json.id,
			json.message_id,
			json.content,
			parseToLocalDate(json.created_at),
			user,
			session
		);

		message.feedbacks.set(Feedback.parseAll(json.feedbacks, message));

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

			if (!m) continue;

			const prev = messages.find((msg) => msg.message_id == m?.message_id);

			if (!prev) {
				messages.push(m);
				continue;
			}

			if (prev.created_at < m.created_at) {
				prev._versions.update((v) => [...v, { content: m.content, date: m.created_at }]);
				prev._content = m.content;
				prev._id = m.id;
				prev._edited = true;
				prev.feedbacks.set(get(m.feedbacks));
			}
		}

		return messages;
	}
}
