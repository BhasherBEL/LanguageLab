import session from '$lib/stores/JWTSession';
import { get } from 'svelte/store';

export function getBaseURL(): string {
	return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
}

export function requireLogin(): boolean {
	if (!session.isLoggedIn()) {
		window.location.href =
			getBaseURL() + '/login/?redirect=' + encodeURIComponent(window.location.href);

		return false;
	}
	return true;
}

export function requireAdmin(): boolean {
	if (!session.isLoggedIn() || get(session.type) !== '0') {
		window.location.href = getBaseURL();
		return false;
	}
	return true;
}

export interface JWTContent {
	sub: string;
	type: number;
	exp: number;
	email: string;
	nickname: string;
	is_active: boolean;
}
