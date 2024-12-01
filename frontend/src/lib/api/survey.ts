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
	code: string,
	sid: string,
	uid: number | null,
	survey_id: number,
	group_id: number,
	question_id: number,
	option_id: number,
	response_time: number,
	text: string = ''
) {
	const response = await axiosInstance.post(`/surveys/responses`, {
		code,
		sid,
		uid,
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

export async function getSurveyScoreAPI(survey_id: number, sid: string) {
	const response = await axiosInstance.get(`/surveys/${survey_id}/score/${sid}`);
	if (response.status !== 200) {
		toastAlert('Failed to retrieve survey score');
		return null;
	}
	return response.data;
}

export async function sendSurveyResponseInfoAPI(
	survey_id: number,
	sid: string,
	birthyear: number,
	gender: string,
	primary_language: string,
	education: string
) {
	const response = await axiosInstance.post(`/surveys/info/${survey_id}`, {
		sid,
		birthyear,
		gender,
		primary_language,
		education
	});

	if (response.status !== 201) {
		toastAlert('Failed to send survey response info');
		return false;
	}

	return true;
}
