import { formatToUTCDate } from '$lib/utils/date';
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

export async function getSessionAPI(id: number) {
	const response = await axiosInstance.get(`/sessions/${id}`);

	if (response.status !== 200) {
		toastAlert('Failed to get session');
		return null;
	}

	return response.data;
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

export async function createMessageAPI(
	id: number,
	content: string,
	metadata: { message: string; date: number }[]
): Promise<any | null> {
	const response = await axiosInstance.post(`/sessions/${id}/messages`, { content, metadata });

	if (response.status !== 201) {
		toastAlert('Failed to send message');
		return null;
	}

	return response.data;
}

export async function updateMessageAPI(
	id: number,
	message_id: string,
	content: string,
	metadata: { message: string; date: number }[]
): Promise<number | null> {
	const response = await axiosInstance.post(`/sessions/${id}/messages`, {
		message_id,
		content,
		metadata
	});

	if (response.status !== 201) {
		toastAlert('Failed to update message');
		return null;
	}

	return response.data;
}

export async function createMessageFeedbackAPI(
	id: number,
	message_id: number,
	start: number,
	end: number,
	content: string | null
): Promise<number> {
	const response = await axiosInstance.post(`/sessions/${id}/messages/${message_id}/feedback`, {
		start,
		end,
		content
	});
	if (response.status !== 201) {
		toastAlert('Failed to add feedback');
		return -1;
	}
	return response.data;
}

export async function deleteMessageFeedbackAPI(
	id: number,
	message_id: number,
	feedback_id: number
) {
	const response = await axiosInstance.delete(
		`/sessions/${id}/messages/${message_id}/feedback/${feedback_id}`
	);
	if (response.status !== 204) {
		toastAlert('Failed to delete feedback');
		return false;
	}
	return true;
}

export async function patchLanguageAPI(id: number, language: string) {
	const response = await axiosInstance.patch(`/sessions/${id}`, { language });

	if (response.status !== 204) {
		toastAlert('Failed to change language');
		return false;
	}

	return true;
}

export async function createSessionSatisfyAPI(
	id: number,
	usefullness: number,
	easiness: number,
	remarks: string
): Promise<boolean> {
	const response = await axiosInstance.post(`/sessions/${id}/satisfy`, {
		usefullness,
		easiness,
		remarks
	});

	if (response.status !== 204) {
		toastAlert('Failed to satisfy session');
		return false;
	}

	return true;
}

export async function createSessionFromCalComAPI(
	user_id: number,
	contact_id: number,
	start: Date,
	end: Date
): Promise<number | null> {
	const response = await axiosInstance.post(`/users/${user_id}/contacts/${contact_id}/bookings`, {
		start_time: formatToUTCDate(start),
		end_time: formatToUTCDate(end)
	});
	if (response.status !== 201) {
		toastAlert('Failed to create cal.com session');
		return null;
	}

	return response.data;
}
