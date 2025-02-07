import { getSurveysAPI } from '$lib/api/survey';
import Survey from '$lib/types/survey';
import { type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const surveys = Survey.parseAll(await getSurveysAPI(fetch));

	return {
		surveys
	};
};
