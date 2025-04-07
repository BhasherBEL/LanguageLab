import { redirect, type Actions } from '@sveltejs/kit';
import { createTestTaskGroupAPI } from '$lib/api/tests';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		const title = formData.get('title')?.toString();
		const demo = formData.get('demo')?.toString() == 'on';
		const randomize = formData.get('randomize')?.toString() == 'on';

		if (!title) {
			return {
				message: 'Invalid request: Missing required fields'
			};
		}

		const questions = formData
			.getAll('questions[]')
			.map((question) => parseInt(question.toString(), 10))
			.filter((question) => !isNaN(question));

		const id = await createTestTaskGroupAPI(fetch, title, demo, randomize, questions);

		if (id === null) {
			return {
				message: 'Error creating test task group'
			};
		}

		return redirect(303, `/admin/tests/groups`);
	}
};
