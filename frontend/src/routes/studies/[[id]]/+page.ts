import { getStudiesAPI, getStudyAPI } from '$lib/api/studies';
import Study from '$lib/types/study.js';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, params }) => {
	const sStudyId: string | undefined = params.id;
	if (sStudyId) {
		const studyId = parseInt(sStudyId);
		if (studyId) {
			const study = Study.parse(await getStudyAPI(fetch, studyId));

			if (study) {
				return {
					study
				};
			}
		}
	}

	const studies = Study.parseAll(await getStudiesAPI(fetch));

	return {
		studyError: true,
		studies
	};
};
