import { getSurveyAPI } from '$lib/api/survey';
import Survey from '$lib/types/survey';
import type { Load } from '@sveltejs/kit';

export const ssr = false;

export const load: Load = async ({ params, parent }) => {
	const data = await parent();
	const survey_id = parseInt(params.id);
	const { user, token } = data;

	if (isNaN(survey_id)) {
		return {
			status: 400,
			body: {
				error: 'Invalid survey id'
			}
		};
	}

	const survey = Survey.parse(await getSurveyAPI(survey_id));

	if (!survey) {
		return {
			status: 404,
			body: {
				error: 'Survey not found'
			}
		};
	}

	return {
		survey_id,
		survey,
		user,
		token
	};
};
