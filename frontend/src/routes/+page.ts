import { getUserContactsAPI, getUserContactSessionsAPI } from '$lib/api/users';
import Session from '$lib/types/session';
import User from '$lib/types/user';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ parent, fetch }) => {
	const { user } = await parent();

	const contacts = User.parseAll(await getUserContactsAPI(fetch, user.id));

	if (contacts.length === 0) {
		return {
			contacts,
			contact: undefined,
			sessions: []
		};
	}

	const contact = contacts[0];
	const sessions = Session.parseAll(
		await getUserContactSessionsAPI(fetch, user.id, contact.id)
	).sort((a, b) => b.start_time.getTime() - a.start_time.getTime());

	return {
		contacts,
		contact,
		sessions
	};
};
