import { getStudiesAPI } from '$lib/api/studies';
import { getSurveysAPI } from '$lib/api/survey';
import Study from '$lib/types/study';
import Survey from '$lib/types/survey';
import { type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const studies = Study.parseAll(await getStudiesAPI(fetch));
	const surveys = Survey.parseAll(await getSurveysAPI(fetch));

	return {
		studies,
		surveys
	};
};
