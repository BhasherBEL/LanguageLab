import { getTestQuestionAPI } from '$lib/api/tests';
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

	const questionRaw = await getTestQuestionAPI(fetch, id);

	if (!questionRaw) {
		return error(404, 'Question not found');
	}

	const question = TestTaskQuestion.parse(questionRaw);

	return { question };
};
