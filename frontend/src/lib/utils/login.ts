import session from '$lib/stores/JWTSession';

export function requireLogin(): boolean {
	if (!session.isLoggedIn()) {
		window.location.href = '/login?redirect=' + encodeURIComponent(window.location.href);
		return false;
	}
	return true;
}

export interface JWTContent {
	sub: string;
	type: number;
	exp: number;
	username: string;
	is_active: boolean;
}
