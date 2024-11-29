import type { fetchType } from '$lib/utils/types';

export async function getSurveyAPI(fetch: fetchType, survey_id: number) {
	const response = await fetch(`/api/surveys/${survey_id}`);
	if (!response.ok) return null;

	return await response.json();
}

export async function sendSurveyResponseAPI(
	fetch: fetchType,
	uuid: string,
	sid: string,
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
			uuid,
			sid,
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

export async function getSurveyScoreAPI(survey_id: number) {
	const response = await fetch(`/api/surveys/${survey_id}/score`);
	if (!response.ok) return null;

	return await response.json();
}
