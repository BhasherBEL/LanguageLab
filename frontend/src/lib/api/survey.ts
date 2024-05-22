import { toastAlert } from '$lib/utils/toasts';
import { axiosInstance } from './apiInstance';

export async function getSurveyAPI(survey_id: number) {
	const response = await axiosInstance.get(`/surveys/${survey_id}`);

	if (response.status !== 200) {
		toastAlert('Failed to get survey');
		return null;
	}

	return response.data;
}
