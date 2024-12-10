import type { fetchType } from '$lib/utils/types';

export async function getUsersAPI(fetch: fetchType): Promise<any[]> {
	const response = await fetch(`/api/users`);
	if (!response.ok) return [];

	return await response.json();
}

export async function getUserAPI(fetch: fetchType, user_id: number): Promise<any | null> {
	const response = await fetch(`/api/users/${user_id}`);
	if (!response.ok) return null;

	return await response.json();
}

export async function loginAPI(
    fetch: fetchType,
    email: string,
    password: string
): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    const response = await fetch(`/tmp-api/v1/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        console.error(`Login failed:`, await response.json());
        return { accessToken: null, refreshToken: null };
    }

    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [key, value] = cookie.split('=');
        acc[key] = decodeURIComponent(value);
        return acc;
    }, {} as Record<string, string>);

    return {
        accessToken: cookies['access_token'] || null,
        refreshToken: cookies['refresh_token'] || null,
    };
}


export async function createUserContactAPI(
	fetch: fetchType,
	user_id: number,
	contact_id: number
): Promise<any | null> {
	const response = await fetch(`/api/users/${user_id}/contacts/${contact_id}`);
	if (!response.ok) return null;

	return await response.json();
}

export async function createUserContactFromEmailAPI(
	fetch: fetchType,
	user_id: number,
	email: string
): Promise<any | null> {
	const response = await fetch(`/api/users/${user_id}/contacts-email/${email}`, { method: 'POST' });
	if (!response.ok) return null;

	return await response.json();
}

export async function getUserContactsAPI(fetch: fetchType, user_id: number): Promise<any[]> {
	const response = await fetch(`/api/users/${user_id}/contacts`);
	if (!response.ok) return [];

	return await response.json();
}

export async function getUserContactSessionsAPI(
	fetch: fetchType,
	user_id: number,
	contact_id: number
): Promise<any[]> {
	const response = await fetch(`/api/users/${user_id}/contacts/${contact_id}/sessions`);
	if (!response.ok) return [];

	return await response.json();
}

export async function createUserAPI(
	fetch: fetchType,
	nickname: string,
	email: string,
	password: string,
	type: number,
	is_active: boolean
): Promise<number | null> {
	const response = await fetch(`/api/users`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ nickname, email, password, type, is_active })
	});

	if (!response.ok) return null;

	return parseInt(await response.text());
}

export async function patchUserAPI(fetch: fetchType, user_id: number, data: any) {
	const response = await fetch(`/api/users/${user_id}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	return response.ok;
}

export async function createTestTypingAPI(
	fetch: fetchType,
	user_id: number,
	entries: typingEntry[]
): Promise<number | null> {
	const response = await fetch(`/api/users/${user_id}/tests/typing`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ entries })
	});

	if (!response.ok) return null;

	return parseInt(await response.text());
}

export async function createWeeklySurveyAPI(
	fetch: fetchType,
	user_id: number,
	q1: number,
	q2: number,
	q3: number,
	q4: number
): Promise<number | null> {
	const response = await fetch(`/api/users/${user_id}/surveys/weekly`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ q1, q2, q3, q4 })
	});

	if (!response.ok) return null;

	return parseInt(await response.text());
}
