import { createStudyAPI } from '$lib/api/studies';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		const title = formData.get('title')?.toString();
		let description = formData.get('description')?.toString();
		const startDateStr = formData.get('startDate')?.toString();
		const endDateStr = formData.get('endDate')?.toString();
		const chatDurationStr = formData.get('chatDuration')?.toString();

		if (!title || !startDateStr || !endDateStr || !chatDurationStr) {
			return {
				message: 'Invalid request'
			};
		}

		if (description === undefined) {
			description = '';
		}

		const startDate = new Date(startDateStr);
		const endDate = new Date(endDateStr);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return {
				message: 'Invalid request'
			};
		}

		const chatDuration = parseInt(chatDurationStr, 10);
		if (isNaN(chatDuration)) {
			return {
				message: 'Invalid request'
			};
		}

		await createStudyAPI(fetch, title, description, startDate, endDate, chatDuration);
	}
};
