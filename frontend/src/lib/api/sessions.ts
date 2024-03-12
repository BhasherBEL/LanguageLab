import { toastAlert } from '$lib/utils/toasts';
import { axiosInstance } from './apiInstance';

export async function getSessionsAPI() {
	const response = await axiosInstance.get(`/sessions`);

	return response.data;
}

export async function createSessionAPI(): Promise<bool> {
	const response = await axiosInstance.post(`/sessions`);

	if (response.status !== 204) {
		toastAlert('Failed to create session');
	}
}

export async function deleteSessionAPI(id: string) {
	const response = await axiosInstance.delete(`/sessions/${id}`);
}
