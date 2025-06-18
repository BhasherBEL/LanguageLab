import { getSurveysAPI } from '$lib/api/survey';
import { type Load } from '@sveltejs/kit';
import { Test } from '$lib/types/tests';

export const load: Load = async ({ fetch }) => {
	const tests = Test.parseAll(await getSurveysAPI(fetch));

	return {
		tests
	};
};
