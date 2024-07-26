import { toastAlert } from '$lib/utils/toasts';
import Message from './message';

export default class Feedback {
	private _id: number;
	private _message: Message;
	private _start: number;
	private _end: number;
	private _content: string | null;

	public constructor(
		id: number,
		message: Message,
		start: number,
		end: number,
		content: string | null
	) {
		this._id = id;
		this._message = message;
		this._start = start;
		this._end = end;
		this._content = content;
	}

	get id(): number {
		return this._id;
	}

	get message(): Message {
		return this._message;
	}

	get start(): number {
		return this._start;
	}

	get end(): number {
		return this._end;
	}

	get content(): string | null {
		return this._content;
	}

	static parse(json: any, message: Message): Feedback | null {
		if (json === null || json == undefined) {
			toastAlert('Failed to parse feedback: json is null');
			return null;
		}

		if (message === null || message == undefined) {
			toastAlert('Failed to parse feedback: message is null');
			return null;
		}

		const feedback = new Feedback(json.id, message, json.start, json.end, json.content);

		return feedback;
	}

	static parseAll(json: any, message: Message): Feedback[] {
		if (json === null || json == undefined) {
			toastAlert('Failed to parse feedbacks: json is null');
			return [];
		}
		const feedbacks: Feedback[] = [];
		for (const feedback of json) {
			const f = Feedback.parse(feedback, message);
			if (f !== null) {
				feedbacks.push(f);
			}
		}
		return feedbacks;
	}
}
