import { toastAlert } from '$lib/utils/toasts';
import type { fetchType } from '$lib/utils/types';

export async function getUsersAPI() {
	const response = await fetch(`/api/users`);

	if (!response.ok) {
		toastAlert('Failed to get users');
		return [];
	}

	return await response.json();
}

export async function getUserAPI(user_id: number) {
	const response = await fetch(`/api/users/${user_id}`);

	console.log(response);

	if (!response.ok) {
		console.log('Failed to get user');
		return null;
	}

	return await response.json();
}

export async function createUserContactAPI(user_id: number, contact_id: number) {
	const response = await axiosInstance.post(`/users/${user_id}/contacts/${contact_id}`);

	if (response.status !== 201) {
		toastAlert('Failed to create user contact');
		return null;
	}

	return response.data;
}

export async function createUserContactFromEmailAPI(user_id: number, email: string) {
	const response = await axiosInstance.post(`/users/${user_id}/contacts-email/${email}`);

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

export async function getUserContactsAPI(fetch: fetchType, user_id: number) {
	const response = await fetch(`/api/users/${user_id}/contacts`);

	if (!response.ok) {
		return [];
	}

	return await response.json();
}

export async function getUserContactSessionsAPI(
	fetch: fetchType,
	user_id: number,
	contact_id: number
) {
	const response = await fetch(`/api/users/${user_id}/contacts/${contact_id}/sessions`);

	if (!response.ok) {
		return [];
	}

	return await response.json();
}

export async function createUserAPI(
	nickname: string,
	email: string,
	password: string,
	type: number,
	is_active: boolean
): Promise<number | null> {
	const response = await axiosInstance.post(`/users`, {
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

export async function patchUserAPI(fetch: fetchType, user_id: number, data: any) {
	return await fetch(`/api/users/${user_id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
}

export async function createTestTypingAPI(
	user_id: number,
	entries: typingEntry[]
): Promise<number | null> {
	const response = await axiosInstance.post(`/users/${user_id}/tests/typing`, {
		entries
	});

	if (response.status !== 201) {
		toastAlert('Failed to create test');
		return null;
	}

	return response.data;
}

export async function createWeeklySurveyAPI(
	user_id: number,
	q1: number,
	q2: number,
	q3: number,
	q4: number
): Promise<number | null> {
	const response = await axiosInstance.post(`/users/${user_id}/surveys/weekly`, {
		q1,
		q2,
		q3,
		q4
	});
	if (response.status !== 201) {
		toastAlert('Failed to create weekly survey');
		return null;
	}
	return response.data;
}
