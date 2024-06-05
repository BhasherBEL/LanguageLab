import { toastAlert } from '$lib/utils/toasts';
import { getAxiosInstance } from './apiInstance';
import { get } from 'svelte/store';

export async function getUsersAPI(session: string) {
	const response = await getAxiosInstance(session).get(`/users`);

	if (response.status !== 200) {
		toastAlert('Failed to get users');
		return [];
	}

	return response.data;
}

export async function getUserAPI(session: string, user_id: number) {
	const response = await getAxiosInstance(session).get(`/users/${user_id}`);

	if (response.status !== 200) {
		toastAlert('Failed to get user');
		return null;
	}

	return response.data;
}

export async function createUserContactAPI(session: string, user_id: number, contact_id: number) {
	const response = await getAxiosInstance(session).post(`/users/${user_id}/contacts/${contact_id}`);

	if (response.status !== 201) {
		toastAlert('Failed to create user contact');
		return null;
	}

	return response.data;
}

export async function createUserContactFromEmailAPI(
	session: string,
	user_id: number,
	email: string
) {
	const response = await getAxiosInstance(session).post(
		`/users/${user_id}/contacts-email/${email}`
	);

	if (response.status === 404) {
		toastAlert('User not found');
		return null;
	}

	if (response.status === 400) {
		toastAlert('User already has this contact');
		return null;
	}

	if (response.status !== 201) {
		toastAlert('Failed to create user contact');
		return null;
	}

	return response.data;
}

export async function getUserContactsAPI(session: string, user_id: number) {
	const response = await getAxiosInstance(session).get(`/users/${user_id}/contacts`);

	if (response.status !== 200) {
		toastAlert('Failed to get user contacts');
		return [];
	}

	return response.data;
}

export async function getUserContactSessionsAPI(
	session: string,
	user_id: number,
	contact_id: number
) {
	const response = await getAxiosInstance(session).get(
		`/users/${user_id}/contacts/${contact_id}/sessions`
	);

	if (response.status !== 200) {
		toastAlert('Failed to get user contact sessions');
		return [];
	}

	return response.data;
}

export async function createUserAPI(
	session: string,
	nickname: string,
	email: string,
	password: string,
	type: number,
	is_active: boolean
): Promise<number | null> {
	const response = await getAxiosInstance(session).post(`/users`, {
		nickname,
		email,
		password,
		type,
		is_active
	});

	if (response.status !== 201) {
		toastAlert('Failed to create user');
		return null;
	}

	return response.data;
}

export async function patchUserAPI(session: string, user_id: number, data: any): Promise<boolean> {
	const response = await getAxiosInstance(session).patch(`/users/${user_id}`, data);

	if (response.status !== 204) {
		toastAlert('Failed to update user');
		return false;
	}

	return true;
}

export async function createTestTypingAPI(
	session: string,
	user_id: number,
	entries: typingEntry[]
): Promise<number | null> {
	const response = await getAxiosInstance(session).post(`/users/${user_id}/tests/typing`, {
		entries
	});

	if (response.status !== 201) {
		toastAlert('Failed to create test');
		return null;
	}

	return response.data;
}
