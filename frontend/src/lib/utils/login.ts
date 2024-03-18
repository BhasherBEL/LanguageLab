import session from '$lib/stores/JWTSession';
import { get } from 'svelte/store';

export function requireLogin(): boolean {
	if (!session.isLoggedIn()) {
		window.location.href = '/login?redirect=' + encodeURIComponent(window.location.href);
		return false;
	}
	return true;
}

export function requireAdmin(): boolean {
	if (!session.isLoggedIn() || get(session.type) !== '0') {
		window.location.href = '/';
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
