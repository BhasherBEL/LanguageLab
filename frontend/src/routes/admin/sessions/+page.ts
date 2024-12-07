import { getSessionsAPI } from '$lib/api/sessions';
import Session from '$lib/types/session';
import { type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const sessions = Session.parseAll(await getSessionsAPI(fetch));

	return {
		sessions
	};
};
