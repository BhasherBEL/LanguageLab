import { toastAlert } from '$lib/utils/toasts';
import { getAxiosInstance } from './apiInstance';

export async function getSessionsAPI(session: string) {
	const response = await getAxiosInstance(session).get(`/sessions`);

	return response.data;
}

export async function createSessionAPI(session: string) {
	const response = await getAxiosInstance(session).post(`/sessions`);

	if (response.status !== 200) {
		toastAlert('Failed to create session');
	}
}

export async function getSessionAPI(session: string, id: number) {
	const response = await getAxiosInstance(session).get(`/sessions/${id}`);

	if (response.status !== 200) {
		toastAlert('Failed to get session');
		return null;
	}

	return response.data;
}

export async function deleteSessionAPI(session: string, id: number) {
	const response = await getAxiosInstance(session).delete(`/sessions/${id}`);

	if (response.status !== 204) {
		toastAlert('Failed to delete session');
	}
}

export async function getMessagesAPI(session: string, id: number) {
	const response = await getAxiosInstance(session).get(`/sessions/${id}/messages`);

	return response.data;
}

export async function createMessageAPI(
	session: string,
	id: number,
	content: string,
	metadata: { message: string; date: number }[]
): Promise<number | null> {
	const response = await getAxiosInstance(session).post(`/sessions/${id}/messages`, {
		content,
		metadata
	});

	if (response.status !== 201) {
		toastAlert('Failed to send message');
		return null;
	}

	return response.data;
}

export async function patchLanguageAPI(session: string, id: number, language: string) {
	const response = await getAxiosInstance(session).patch(`/sessions/${id}`, { language });

	if (response.status !== 204) {
		toastAlert('Failed to change language');
		return false;
	}

	return true;
}
