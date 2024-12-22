import type { fetchType } from '$lib/utils/types';

export async function getSurveyAPI(fetch: fetchType, survey_id: number) {
	const response = await fetch(`/api/surveys/${survey_id}`);
	if (!response.ok) return null;

	return await response.json();
}

export async function sendSurveyResponseAPI(
	fetch: fetchType,
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
	const response = await fetch(`/api/surveys/responses`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			code,
			sid,
			uid,
			survey_id,
			question_id,
			group_id,
			selected_id: option_id,
			response_time,
			text
		})
	});

	return response.ok;
}

export async function getSurveyScoreAPI(fetch: fetchType, survey_id: number, sid: string) {
	const response = await fetch(`/api/surveys/${survey_id}/score/${sid}`);
	if (!response.ok) return null;

	return await response.json();
}

export async function sendSurveyResponseInfoAPI(
	fetch: fetchType,
	survey_id: number,
	sid: string,
	birthyear: number,
	gender: string,
	primary_language: string,
	other_language: string,
	education: string
) {
	const response = await fetch(`/api/surveys/info/${survey_id}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			sid,
			birthyear,
			gender,
			primary_language,
			other_language,
			education
		})
	});

	return response.ok;
}
