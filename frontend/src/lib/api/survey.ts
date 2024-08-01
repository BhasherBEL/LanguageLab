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
	sid: string,
	survey_id: number,
	group_id: number,
	question_id: number,
	option_id: number,
	response_time: number,
	text: string = ''
) {
	const response = await axiosInstance.post(`/surveys/responses`, {
		uuid,
		sid,
		survey_id,
		question_id,
		group_id,
		selected_id: option_id,
		response_time,
		text
	});

	if (response.status !== 201) {
		toastAlert('Failed to send survey response');
		return false;
	}

	return true;
}
