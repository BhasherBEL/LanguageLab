import { getTestQuestionsAPI } from '$lib/api/tests';
import { type Load } from '@sveltejs/kit';
import { TestTaskQuestion } from '$lib/types/testTaskQuestions';

export const load: Load = async ({ fetch }) => {
	const questionsRaw = await getTestQuestionsAPI(fetch);
	const questions = TestTaskQuestion.parseAll(questionsRaw);

	return {
		questions
	};
};
