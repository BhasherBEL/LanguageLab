import { getSurveysAPI } from '$lib/api/survey';
import { type Load, redirect } from '@sveltejs/kit';
import Study from '$lib/types/study.js';
import { getStudyAPI } from '$lib/api/studies';
import { Test } from '$lib/types/tests';

export const load: Load = async ({ fetch, params }) => {
	const id = Number(params.id);

	const study = Study.parse(await getStudyAPI(fetch, id));

	if (!study) {
		redirect(303, '/admin/studies');
	}

	const tests = Test.parseAll(await getSurveysAPI(fetch));

	return {
		tests,
		study
	};
};
