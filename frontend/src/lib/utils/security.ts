import { redirect } from '@sveltejs/kit';

export function isRedirectPathValid(path: string, origin: string): boolean {
	try {
		const url = new URL(path, origin);
		return url.origin == origin;
	} catch (e) {
		return false;
	}
}

export function safeRedirect(path: string | null | undefined, origin: string) {
	if (!path || !isRedirectPathValid(path, origin)) path = '/';
	return redirect(302, path);
}

export function safeRedirectAuto(url: URL) {
	return safeRedirect(url.searchParams.get('redirect'), url.origin);
}

export function validateEmail(email: unknown): email is string {
	return (
		typeof email === 'string' &&
		email.length >= 3 &&
		email.length <= 255 &&
		/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)
	);
}

export function validateUsername(username: unknown): username is string {
	return typeof username === 'string' && username.length >= 3 && username.length <= 31;
}

export function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 8 && password.length <= 255;
}
