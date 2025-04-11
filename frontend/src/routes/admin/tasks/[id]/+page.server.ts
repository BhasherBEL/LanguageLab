import { updateTaskAPI } from '$lib/api/tasks';
import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		const idStr = formData.get('id')?.toString();
		const level = formData.get('level')?.toString();
		const shortTitle = formData.get('shortTitle')?.toString();

		const instructions = formData.get('instructions')?.toString() || '';

		const learnerInstructions = formData.get('learnerInstructions')?.toString() || '';

		const examples = formData.get('examples')?.toString();

		if (!level || !shortTitle || !examples || !idStr) {
			return {
				message: 'Invalid request: Missing required fields'
			};
		}

		const id = parseInt(idStr, 10);
		if (isNaN(id)) {
			return {
				message: 'Invalid request: Invalid task ID'
			};
		}

		const ok = await updateTaskAPI(
			fetch,
			id,
			level,
			shortTitle,
			instructions,
			learnerInstructions,
			examples
		);

		if (!ok) {
			return {
				message: 'Invalid request: Failed to update task'
			};
		}

		return redirect(303, `/admin/tasks`);
	}
};
