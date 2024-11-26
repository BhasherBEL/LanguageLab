import { getSessionAPI } from '$lib/api/sessions';
import Session from '$lib/types/session';
import { error, type Load } from '@sveltejs/kit';

export const load: Load = async ({ params, data }) => {
	if (!data || !data.jwt) error(401, 'Unauthorized');

	const id = params.id;
	if (!id) {
		error(404, 'Not found');
	}

	const nid = parseInt(id);
	if (isNaN(nid)) {
		error(404, 'Not found');
	}

	const session = Session.parse(await getSessionAPI(nid, data.jwt));
	if (!session) {
		error(404, 'Not found');
	}

	await session.loadMessages(data.jwt);

	return {
		session: session
	};
};
