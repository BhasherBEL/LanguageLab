import { type ServerLoad, redirect } from '@sveltejs/kit';
import { access_cookie } from '$lib/api/apiInstance';

export const load: ServerLoad = async ({ cookies }) => {
	cookies.set('access_token_cookie', '', { maxAge: -1, path: '/' });
	cookies.set('refresh_token_cookie', '', { maxAge: -1, path: '/' });
	access_cookie.set('');

	redirect(307, '/login');
};
