import { toastAlert } from '$lib/utils/toasts';
import { axiosInstance, access_cookie } from './apiInstance';
import { get } from 'svelte/store';

export async function getUsersAPI() {
	const response = await axiosInstance.get(`/users`);

	if (response.status !== 200) {
		toastAlert('Failed to get users');
		return [];
	}

	return response.data;
}

export async function getUserAPI(user_id: number) {
	const response = await axiosInstance.get(`/users/${user_id}`, {
		headers: {
			Authorization: `Bearer ${get(access_cookie)}`
		}
	});

	if (response.status !== 200) {
		toastAlert('Failed to get user');
		return null;
	}

	return response.data;
}

export async function getUserByEmailAPI(email: string) {
	const response = await axiosInstance.get(`/users/by-email/${email}`);
	if (response.status !== 200) {
		toastAlert('Failed to get user');
		return null;
	}
	return response.data;
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

export async function getUserContactsAPI(user_id: number) {
	const response = await axiosInstance.get(`/users/${user_id}/contacts`, {
		headers: {
			Authorization: `Bearer ${get(access_cookie)}`
		}
	});

	if (response.status !== 200) {
		toastAlert('Failed to get user contacts');
		return [];
	}

	return response.data;
}

export async function getUserContactSessionsAPI(user_id: number, contact_id: number) {
	const response = await axiosInstance.get(`/users/${user_id}/contacts/${contact_id}/sessions`, {
		headers: {
			Authorization: `Bearer ${get(access_cookie)}`
		}
	});

	if (response.status !== 200) {
		toastAlert('Failed to get user contact sessions');
		return [];
	}

	return response.data;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function patchUserAPI(user_id: number, data: any): Promise<boolean> {
	try {
		const response = await axiosInstance.patch(`/users/${user_id}`, data);

		if (response.status !== 204) {
			toastAlert('Failed to update user');
			return false;
		}

		return true;
	} catch (e) {
		console.error(e);
		toastAlert('Failed to update user due to unknown error');
		return false;
	}
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
