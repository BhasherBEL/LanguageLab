import { getTasksAPI } from '$lib/api/tasks';
import Task from '$lib/types/tasks';
import { type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const tasks = Task.parseAll(await getTasksAPI(fetch));

	return {
		tasks
	};
};
