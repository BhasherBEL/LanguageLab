import { getSurveysAPI } from '$lib/api/survey';
import Survey from '$lib/types/survey';
import { type Load, redirect } from '@sveltejs/kit';
import Study from '$lib/types/study.js';
import { getStudyAPI } from '$lib/api/studies';

export const load: Load = async ({ fetch, params }) => {
	const surveys = Survey.parseAll(await getSurveysAPI(fetch));

	const id = Number(params.id);

	const study = Study.parse(await getStudyAPI(fetch, id));

	if (!study) {
		redirect(303, '/admin/studies');
	}

	return {
		surveys,
		study
	};
};
