import { redirect, type Actions } from '@sveltejs/kit';
import { createTestTypingAPI } from '$lib/api/tests';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		const title = formData.get('title')?.toString();
		const demo = formData.get('demo')?.toString() == 'on';
		const randomize = formData.get('randomize')?.toString() == 'on';

		if (!title || !demo || !randomize) {
			return {
				message: 'Invalid request: Missing required fields'
			};
		}

		const questions = formData
			.getAll('questions[]')
			.map((question) => parseInt(question.toString(), 10))
			.filter((question) => !isNaN(question));

		const id = await createTestTaskGroupAPI(fetch, title, demo, randomize, questions);

		return redirect(303, `/admin/tests`);
	}
};
