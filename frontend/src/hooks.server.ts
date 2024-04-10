import type { Handle } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';
import { type JWTContent } from '$lib/utils/login';
import { getUserAPI } from '$lib/api/users';
import User from '$lib/types/user';
import { access_cookie } from '$lib/api/apiInstance';

export const handle: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get('access_token_cookie');
	if (!session) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const decoded = jwtDecode<JWTContent>(session);
	console.log(decoded);
	if (!decoded) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const id = parseInt(decoded.subject.uid);
	if (!id) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	access_cookie.set(session);
	const user = User.parse(await getUserAPI(id));

	event.locals.user = user.toJson();
	event.locals.session = session;
	return resolve(event);
};
