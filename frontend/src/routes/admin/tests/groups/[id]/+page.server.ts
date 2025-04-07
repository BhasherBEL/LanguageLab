import { redirect, type Actions } from '@sveltejs/kit';
import { updateTestTypingAPI } from '$lib/api/tests';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		const idStr = formData.get('id')?.toString();
		const title = formData.get('title')?.toString();
		const type = formData.get('type')?.toString();

		if (!title || !type || !idStr || (type !== 'typing' && type !== 'task')) {
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

			const ok = await updateTestTypingAPI(fetch, id, title, explanation, text, repeat, duration);

			if (!ok) {
				return {
					message: 'Invalid request: Failed to update test'
				};
			}

			return redirect(303, `/admin/tests`);
		}
	}
};
