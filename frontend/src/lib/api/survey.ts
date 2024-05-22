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

export async function sendSurveyResponseAPI(
	uuid: string,
	survey_id: number,
	question_id: number,
	option_id: number,
	response_time: number
) {
	const response = await axiosInstance.post(`/surveys/${survey_id}/responses`, {
		uuid,
		question_id,
		option_id,
		response_time
	});

	if (response.status !== 201) {
		toastAlert('Failed to send survey response');
		return false;
	}

	return true;
}
