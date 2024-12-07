import { getSurveyAPI } from '$lib/api/survey';
import Survey from '$lib/types/survey';
import { error, type Load } from '@sveltejs/kit';

export const ssr = false;

export const load: Load = async ({ params, parent, fetch }) => {
	const { user } = await parent();

	if (!params.id) return error(400, 'Invalid survey ID');

	const survey_id = parseInt(params.id);

	if (isNaN(survey_id)) return error(400, 'Invalid survey ID');

	const survey = Survey.parse(await getSurveyAPI(fetch, survey_id));

	if (!survey) return error(404, 'Survey not found');

	return {
		survey,
		user
	};
};
