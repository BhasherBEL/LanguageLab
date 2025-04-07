import { redirect, type Actions } from '@sveltejs/kit';
import { updateTestTaskGroupAPI } from '$lib/api/tests';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		const idStr = formData.get('id')?.toString();
		const title = formData.get('title')?.toString();
		const demo = formData.get('demo')?.toString() == 'on';
		const randomize = formData.get('randomize')?.toString() == 'on';

		if (!idStr || !title) {
			return {
				message: 'Invalid request: Missing required fields'
			};
		}

		const id = parseInt(idStr, 10);

		if (isNaN(id)) {
			return {
				message: 'Invalid request: Invalid ID'
			};
		}

		const questions = formData
			.getAll('questions[]')
			.map((question) => parseInt(question.toString(), 10))
			.filter((question) => !isNaN(question));

		const ok = await updateTestTaskGroupAPI(fetch, id, title, demo, randomize, questions);

		if (!ok) {
			return {
				message: 'Error updating test task group'
			};
		}

		return redirect(303, `/admin/tests/groups`);
	}
};
