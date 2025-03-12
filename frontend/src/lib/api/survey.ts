import type { fetchType } from '$lib/utils/types';

export async function getSurveysAPI(fetch: fetchType) {
	const response = await fetch('/api/tests');
	if (!response.ok) return null;
	return await response.json();
}

export async function getSurveyAPI(fetch: fetchType, survey_id: number) {
	const response = await fetch(`/api/tests/${survey_id}`);
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
	const response = await fetch(`/api/tests/responses`, {
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
	const response = await fetch(`/api/tests/${survey_id}/score/${sid}`);
	if (!response.ok) return null;

	return await response.json();
}
