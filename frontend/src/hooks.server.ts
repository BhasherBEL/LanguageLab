import type { Handle } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';
import { type JWTContent } from '$lib/utils/login';
import { getUserAPI } from '$lib/api/users';
import User from '$lib/types/user';
import { access_cookie } from '$lib/api/apiInstance';
import config from '$lib/config';

// credits: https://sami.website/blog/sveltekit-api-reverse-proxy
const handleAPIProxy: Handle = async ({ event }) => {
	const origin = event.request.headers.get('Origin');
	//if (!origin || new URL(origin).origin != event.url.origin) {
	//	return new Response('Forbidden', { status: 403 });
	//}

	const pathname = event.url.pathname.replace('/api/docs', '/docs');

	const urlPath = config.API_PROXY + pathname + event.url.search;
	const proxiedUrl = new URL(urlPath);

	return fetch(proxiedUrl, {
		body: event.request.body,
		method: event.request.method,
		headers: event.request.headers,
		duplex: 'half'
	}).catch((err) => {
		console.error('API Proxy Error:', err);
		return new Response('Internal Server Error', { status: 500 });
	});
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.session = null;
	event.locals.locale = 'fr';

	if (event.url.pathname.startsWith('/api') || event.url.pathname.startsWith('/openapi.json')) {
		return await handleAPIProxy({ event });
	}

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

	access_cookie.set(session);
	const user = User.parse(await getUserAPI(id));
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
