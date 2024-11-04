import { formatToUTCDate } from '$lib/utils/date';
import { toastAlert } from '$lib/utils/toasts';
import { axiosInstance } from './apiInstance';

export async function getStudiesAPI() {
	const response = await axiosInstance.get('/studies');
	return response.data;
}

export async function deleteStudyAPI(id: number) {
	const response = await axiosInstance.delete(`/studies/${id}`);
	if (response.status !== 204) {
		toastAlert('Failed to delete study');
	}
}

export async function createStudyAPI(
	title: string,
	description: string,
	startDate: Date,
	endDate: Date,
	chatDuration: number
): Promise<number | null> {
	const response = await axiosInstance.post('/studies', {
		title,
		description,
		start_date: formatToUTCDate(startDate),
		end_date: formatToUTCDate(endDate),
		chat_duration: chatDuration
	});
	if (response.status !== 201) {
		toastAlert('Failed to create study');
		return null;
	}

	return response.data;
}

export async function patchStudyAPI(study_id: number, data: any): Promise<boolean> {
	try {
		const response = await axiosInstance.patch(`/studies/${study_id}`, data);
		if (response.status !== 204) {
			toastAlert('Failed to update study');
			return false;
		}
		return true;
	} catch (e) {
		console.error(e);
		toastAlert('Failed to update study due to unknown error');
		return false;
	}
}
