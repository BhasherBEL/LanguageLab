import { getTestQuestionsAPI, getTestTaskGroupAPI } from '$lib/api/tests';
import TestTaskGroup from '$lib/types/testTaskGroups';
import { TestTaskQuestion } from '$lib/types/testTaskQuestions';
import { error, type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, params }) => {
	const idStr = params?.id;

	if (!idStr) {
		return error(400, 'Invalid ID');
	}

	const id = parseInt(idStr, 10);

	if (isNaN(id)) {
		return error(400, 'Invalid ID');
	}

	const groupRaw = await getTestTaskGroupAPI(fetch, id);

	if (!groupRaw) {
		return error(404, 'Group not found');
	}

	const group = TestTaskGroup.parse(groupRaw);

	const questionsRaw = await getTestQuestionsAPI(fetch);
	const questions = TestTaskQuestion.parseAll(questionsRaw);

	return { group, possibleQuestions: questions };
};
