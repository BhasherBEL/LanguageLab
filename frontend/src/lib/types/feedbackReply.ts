import {
	createFeedbackReplyAPI,
	getFeedbackRepliesAPI,
	updateFeedbackReplyAPI,
	deleteFeedbackReplyAPI
} from '$lib/api/sessions';
import { parseToLocalDate } from '$lib/utils/date';
import { toastAlert } from '$lib/utils/toasts';
import Feedback from './feedback';
import User from './user';

export default class FeedbackReply {
	private _id: number;
	private _feedback: Feedback;
	private _user: User;
	private _content: string;
	private _created_at: Date;

	public constructor(
		id: number,
		feedback: Feedback,
		user: User,
		content: string,
		created_at: Date = new Date()
	) {
		this._id = id;
		this._feedback = feedback;
		this._user = user;
		this._content = content;
		this._created_at = created_at;
	}

	get id(): number {
		return this._id;
	}

	get feedback(): Feedback {
		return this._feedback;
	}

	get user(): User {
		return this._user;
	}

	get content(): string {
		return this._content;
	}

	get created_at(): Date {
		return this._created_at;
	}

	get uuid(): string {
		return `feedback-reply-${this._id}`;
	}

	static parse(json: any, feedback: Feedback): FeedbackReply | null {
		if (json === null || json == undefined) {
			console.error('Failed to parse feedback reply: json is null');
			toastAlert('Failed to parse feedback reply: json is null');
			return null;
		}

		if (feedback === null || feedback == undefined) {
			console.error('Failed to parse feedback reply: feedback is null');
			toastAlert('Failed to parse feedback reply: feedback is null');
			return null;
		}

		// Parse the user from the response data
		const user = User.parse(json.user);
		if (!user) {
			console.error('Failed to parse user data for feedback reply');
			toastAlert('Failed to parse user data for feedback reply');
			return null;
		}

		const reply = new FeedbackReply(
			json.id,
			feedback,
			user,
			json.content,
			parseToLocalDate(json.created_at)
		);

		return reply;
	}

	async create(): Promise<boolean> {
		const response = await createFeedbackReplyAPI(
			fetch,
			this._feedback.message.session.id,
			this._feedback.message.id,
			this._feedback.id,
			this._content
		);
		if (!response) {
			toastAlert('Failed to create feedback reply');
			return false;
		}
		this._id = response;
		return true;
	}

	async update(content: string): Promise<boolean> {
		const response = await updateFeedbackReplyAPI(
			fetch,
			this._feedback.message.session.id,
			this._feedback.message.id,
			this._feedback.id,
			this._id,
			content
		);
		if (!response) {
			toastAlert('Failed to update feedback reply');
			return false;
		}
		this._content = content;
		return true;
	}

	async delete(): Promise<boolean> {
		return await deleteFeedbackReplyAPI(
			fetch,
			this._feedback.message.session.id,
			this._feedback.message.id,
			this._feedback.id,
			this._id
		);
	}

	static async getReplies(feedback: Feedback): Promise<FeedbackReply[]> {
		const response = await getFeedbackRepliesAPI(
			fetch,
			feedback.message.session.id,
			feedback.message.id,
			feedback.id
		);
		if (!response) {
			toastAlert('Failed to get feedback replies');
			return [];
		}
		return FeedbackReply.parseAll(response, feedback);
	}

	static parseAll(json: any, feedback: Feedback): FeedbackReply[] {
		if (json === null || json == undefined) {
			toastAlert('Failed to parse feedback replies: json is null');
			return [];
		}
		const replies: FeedbackReply[] = [];
		for (const reply of json) {
			const r = FeedbackReply.parse(reply, feedback);
			if (r !== null) {
				replies.push(r);
			}
		}
		return replies;
	}

	localUpdate(content: string): void {
		this._content = content;
	}

	to_dict(): any {
		return {
			id: this._id,
			feedback_id: this._feedback.id,
			user_id: this._user.id,
			user: {
				id: this._user.id,
				email: this._user.email,
				nickname: this._user.nickname,
				type: this._user.type,
				is_active: this._user.is_active
			},
			content: this._content,
			created_at: this._created_at.toISOString()
		};
	}
}
