import { getSurveysAPI } from '$lib/api/survey';
import { Test } from '$lib/types/tests';
import { type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const tests = Test.parseAll(await getSurveysAPI(fetch));

	return {
		tests
	};
};
