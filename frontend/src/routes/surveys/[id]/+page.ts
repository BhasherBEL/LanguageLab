import { getSurveyAPI } from '$lib/api/survey';
import Survey from '$lib/types/survey';

export const ssr = false;

export const load = async ({ params }: { params: Record<string, string> }) => {
	const survey_id = parseInt(params.id);

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
		survey_id: survey_id,
		survey: survey
	};
};
