import Session from './session';
import User from './user';
import { updateMessageAPI, createMessageFeedbackAPI, getMessagesAPI } from '$lib/api/sessions';
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
	private _replyTo: any;

	public constructor(
		id: number,
		message_id: string,
		content: string,
		created_at: Date,
		user: User,
		session: Session,
		replyTo: string
	) {
		this._id = id;
		this._message_id = message_id;
		this._content = content;
		this._created_at = created_at;
		this._user = user;
		this._session = session;
		this._versions.set([{ content: content, date: created_at }]);
		this._replyTo = replyTo;
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

	get replyTo(): any {
		return this._replyTo;
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

	async getMessageById(id: number): Promise<Message | null> {
		try {
			const response = await getMessagesAPI(this._session.id); // Fetch all messages for the session
			console.log('Response from API2:', response);
			if (!response) {
				toastAlert('Failed to retrieve messages from the server.');
				return null;
			}
	
			// Locate the message by ID in the response
			const messageData = response.find((msg: any) => msg.id === id);
			if (!messageData) {
				toastAlert(`Message with ID ${id} not found.`);
				return null;
			}
			console.log('Message data:', messageData);
	
			// Parse the message object
			const parsedMessage = Message.parse(messageData, this._user, this._session);
			if (!parsedMessage) {
				toastAlert(`Failed to parse message with ID ${id}`);
				return null;
			}
	
			return parsedMessage;
		} catch (error) {
			console.error(`Error while fetching message by ID ${id}:`, error);
			toastAlert(`Unexpected error while retrieving message.`);
			return null;
		}
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
			session,
			json.reply_to_message_id
		);
		console.log('Parsing message:', json);
	
		// if (json.reply_to_message_id) {
		// 	console.log('Parsing reply to:', json.reply_to_message_id);
		// 	message.replyTo = Message.parse(json.reply_to_message_id);
		// } else {
		// 	console.log('No reply to:', json.reply_to_message_id);
		// 	message.replyTo = null;
		// }
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
