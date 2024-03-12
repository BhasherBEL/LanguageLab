import session from '$lib/stores/session';

export function requireLogin() {
	if (!session.isLoggedIn()) {
		window.location.href = '/login?redirect=' + window.location.pathname;
	}
}
export interface JWTContent {
	sub: string;
	type: number;
	exp: number;
	username: string;
	is_active: boolean;
}
