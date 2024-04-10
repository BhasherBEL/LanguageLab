import type { Handle } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';
import { type JWTContent } from '$lib/utils/login';
import { getUserAPI } from '$lib/api/users';
import User from '$lib/types/user';

// export type Handle = (input: {
//	event: RequestEvent;
//	resolve(event: RequestEvent, opts?: ResolveOptions): MaybePromise<Response>;
// }) => MaybePromise<Response>;

export const handle: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get('token');
	if (!session) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const decoded = jwtDecode<JWTContent>(session);
	if (!decoded) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const id = parseInt(decoded.sub);
	if (!id) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const user = User.parse(await getUserAPI(id));

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};
