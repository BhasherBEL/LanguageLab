import { getStudiesAPI, getStudyAPI } from '$lib/api/studies';
import { getUsersAPI, getTutorsByStudyAPI } from '$lib/api/users';
import Study from '$lib/types/study';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ parent, fetch, params, url }) => {
	const { user } = await parent();
	console.log(user);

	const sStudyId: string | undefined = params.studyId;
	let study = null;
	if (sStudyId) {
		const studyId = parseInt(sStudyId);
		if (studyId) {
			study = Study.parse(await getStudyAPI(fetch, studyId));
		}
	} else if (user) {
		const studyId = user.studies_id[0];
		if (studyId) {
			study = Study.parse(await getStudyAPI(fetch, studyId));
		}
	}

	const studies = Study.parseAll(await getStudiesAPI(fetch));

	let tutors: any[] = [];
	if (study && study.id) {
		tutors = await getTutorsByStudyAPI(fetch, study.id);
	}

	let role = 'learner';
	if (url.searchParams.has('role')) {
		const roleParam = url.searchParams.get('role');
		if (roleParam && roleParam === 'tutor') {
			role = 'tutor';
		}
	}

	return {
		studyError: !study,
		study,
		studies,
		tutors,
		role
	};
};
