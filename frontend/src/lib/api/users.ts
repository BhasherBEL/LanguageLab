import { toastAlert } from '$lib/utils/toasts';
import { axiosInstance } from './apiInstance';

export async function getUsersAPI() {
	const response = await axiosInstance.get(`/users`);

	if (response.status !== 200) {
		toastAlert('Failed to get users');
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
