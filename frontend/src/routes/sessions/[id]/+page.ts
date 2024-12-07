import { getSessionAPI } from '$lib/api/sessions';
import Session from '$lib/types/session';
import { error, type Load } from '@sveltejs/kit';

export const load: Load = async ({ params, fetch, data }) => {
	const jwt = data?.jwt;

	const id = params.id;
	if (!id) {
		error(404, 'Not found');
	}

	const nid = parseInt(id);
	if (isNaN(nid)) {
		error(404, 'Not found');
	}

	const session = Session.parse(await getSessionAPI(fetch, nid));
	if (!session) {
		error(404, 'Not found');
	}

	await session.loadMessages(fetch);

	return { session, jwt };
};
