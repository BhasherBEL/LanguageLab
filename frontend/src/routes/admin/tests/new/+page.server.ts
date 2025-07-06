import { redirect, type Actions } from '@sveltejs/kit';
import { createTestTaskAPI, createTestTypingAPI } from '$lib/api/tests';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		const title = formData.get('title')?.toString();
		const type = formData.get('type')?.toString();

		if (!title || !type || (type !== 'typing' && type !== 'task')) {
			return {
				message: 'Invalid request: Missing required fields'
			};
		}

		if (type === 'typing') {
			const explanation = formData.get('explanation')?.toString();
			const text = formData.get('text')?.toString();
			const repeatStr = formData.get('repeat')?.toString();
			const durationStr = formData.get('duration')?.toString();

			if (!explanation || !text || !repeatStr || !durationStr) {
				return {
					message: 'Invalid request: Missing required fields'
				};
			}

			const repeat = parseInt(repeatStr, 10);
			const duration = parseInt(durationStr, 10);

			if (isNaN(repeat) || isNaN(duration)) {
				return {
					message: 'Invalid request: Invalid format for numbers'
				};
			}

			const id = await createTestTypingAPI(fetch, title, explanation, text, repeat, duration);

			if (id === null) {
				return {
					message: 'Invalid request: Failed to create test'
				};
			}

			return redirect(303, `/admin/tests`);
		} else if (type === 'task') {
			const groups = formData
				.getAll('groups[]')
				.map((group) => parseInt(group.toString(), 10))
				.filter((group) => !isNaN(group));

			const id = await createTestTaskAPI(fetch, title, groups);

			if (id === null) {
				return {
					message: 'Invalid request: Failed to create test'
				};
			}

			return redirect(303, `/admin/tests`);
		}
	}
};
