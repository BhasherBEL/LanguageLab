import { toastAlert } from '$lib/utils/toasts';
import { axiosInstance } from './apiInstance';

export async function getSessionsAPI() {
	const response = await axiosInstance.get(`/sessions`);

	return response.data;
}

export async function createSessionAPI() {
	const response = await axiosInstance.post(`/sessions`);

	if (response.status !== 200) {
		toastAlert('Failed to create session');
	}
}

export async function deleteSessionAPI(id: number) {
	const response = await axiosInstance.delete(`/sessions/${id}`);

	if (response.status !== 204) {
		toastAlert('Failed to delete session');
	}
}

export async function getMessagesAPI(id: number) {
	const response = await axiosInstance.get(`/sessions/${id}/messages`);

	return response.data;
}

export async function createMessageAPI(id: number, content: string) {
	const response = await axiosInstance.post(`/sessions/${id}/messages`, { content });

	if (response.status !== 201) {
		toastAlert('Failed to send message');
	}
}
