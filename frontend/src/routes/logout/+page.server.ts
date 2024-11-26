import { type ServerLoad, redirect } from '@sveltejs/kit';

export const load: ServerLoad = async ({ cookies }) => {
	cookies.set('access_token_cookie', '', { maxAge: -1, path: '/' });
	cookies.set('refresh_token_cookie', '', { maxAge: -1, path: '/' });

	redirect(307, '/login');
};
