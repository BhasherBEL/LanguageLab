import { getTestQuestionsAPI } from '$lib/api/tests';
import { TestTaskQuestion } from '$lib/types/testTaskQuestions';
import { type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const questionsRaw = await getTestQuestionsAPI(fetch);
	const questions = TestTaskQuestion.parseAll(questionsRaw);

	return { possibleQuestions: questions };
};
