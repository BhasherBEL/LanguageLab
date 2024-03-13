import type Session from './session';
import type User from './user';

export default class Message {
	private _id: number;
	private _content: string;
	private _created_at: string;
	private _user: User;
	private _session: Session;

	private constructor(
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
}
