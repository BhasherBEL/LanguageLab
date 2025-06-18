import { type Handle, type RequestEvent } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';
import { type JWTContent } from '$lib/utils/login';
import config from '$lib/config';

const PROXY_PATH = '/api';

const handleApiProxy = async (event: RequestEvent, cookies: { name: string; value: string }[]) => {
	const strippedPath = event.url.pathname.substring(PROXY_PATH.length);

	const urlPath = `${config.API_URL}/v1${strippedPath}${event.url.search}`;
	const proxiedUrl = new URL(urlPath);

	event.request.headers.delete('connection');
	event.request.headers.set('cookie', cookies.map((c) => `${c.name}=${c.value}`).join('; '));

	return fetch(proxiedUrl.toString(), {
		body: event.request.body,
		method: event.request.method,
		headers: event.request.headers,
		// @ts-ignore: Duplex is missing
		duplex: 'half'
	}).catch((err: any) => {
		console.log('Could not proxy API request: ', err);
		throw err;
	});
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.jwt = null;
	event.locals.locale = 'fr';

	const cookies = event.cookies.getAll();

	if (event.url.pathname.startsWith(PROXY_PATH)) {
		return await handleApiProxy(event, cookies);
	}

	const localeCookie = event.cookies.get('locale');
	const initLocale = localeCookie || event.locals.locale;
	event.locals.locale = initLocale;

	const jwt = event.cookies.get('access_token_cookie');
	if (!jwt) {
		return resolve(event);
	}

	const decoded = jwtDecode<JWTContent>(jwt);
	if (!decoded) {
		return resolve(event);
	}

	const id = parseInt(decoded.subject.uid);
	if (!id) {
		return resolve(event);
	}

	const response = await event.fetch(`/api/users/${id}`);
	if (!response.ok) {
		return resolve(event);
	}

	const user = await response.json();
	if (!user) {
		return resolve(event);
	}

	event.locals.user = user;
	event.locals.jwt = jwt;
	return resolve(event);
};
