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

export async function patchUserAPI(user_id: number, data: any): Promise<boolean> {
	const response = await axiosInstance.patch(`/users/${user_id}`, data);

	if (response.status !== 204) {
		toastAlert('Failed to update user');
		return false;
	}

	return true;
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
