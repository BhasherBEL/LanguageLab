import { getStudiesAPI } from '$lib/api/studies';
import Study from '$lib/types/study';
import { type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const studies = Study.parseAll(await getStudiesAPI(fetch));

	return {
		studies
	};
};
