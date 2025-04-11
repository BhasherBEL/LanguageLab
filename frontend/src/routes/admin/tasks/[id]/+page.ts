import { getTaskAPI } from '$lib/api/tasks';
import Task from '$lib/types/tasks';
import { error, type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, params }) => {
	const idStr = params.id;
	if (!idStr) {
		return error(400, 'Invalid request: Missing task ID');
	}
	const id = parseInt(idStr, 10);

	const task = Task.parse(await getTaskAPI(fetch, id));
	if (!task) {
		return error(404, 'Task not found');
	}

	return {
		task
	};
};
