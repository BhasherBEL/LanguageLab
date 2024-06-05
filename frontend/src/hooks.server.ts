import type { Handle } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';
import { type JWTContent } from '$lib/utils/login';
import { getUserAPI } from '$lib/api/users';
import User from '$lib/types/user';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.session = null;
	event.locals.locale = 'fr';

	const session = event.cookies.get('access_token_cookie');
	if (!session) {
		return resolve(event);
	}

	const decoded = jwtDecode<JWTContent>(session);
	if (!decoded) {
		return resolve(event);
	}

	const id = parseInt(decoded.subject.uid);
	if (!id) {
		return resolve(event);
	}

	const user = User.parse(await getUserAPI(session, id));
	if (!user) {
		return resolve(event);
	}

	const localeCookie = event.cookies.get('locale');
	const initLocale = localeCookie || event.locals.locale;

	event.locals.user = user.toJson();
	event.locals.session = session;
	event.locals.locale = initLocale;
	return resolve(event);
};
