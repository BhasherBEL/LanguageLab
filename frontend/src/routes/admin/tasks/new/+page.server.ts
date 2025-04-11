import { createTaskAPI } from '$lib/api/tasks';
import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		const level = formData.get('level')?.toString();
		const shortTitle = formData.get('shortTitle')?.toString();

		const instructions = formData.get('instructions')?.toString() || '';

		const learnerInstructions = formData.get('learnerInstructions')?.toString() || '';

		const examples = formData.get('examples')?.toString();

		if (!level || !shortTitle || !examples) {
			return {
				message: 'Invalid request: Missing required fields'
			};
		}

		const id = await createTaskAPI(
			fetch,
			level,
			shortTitle,
			instructions,
			learnerInstructions,
			examples
		);

		if (id === undefined) {
			return {
				message: 'Invalid request: Failed to create task'
			};
		}

		return redirect(303, `/admin/tasks`);
	}
};
