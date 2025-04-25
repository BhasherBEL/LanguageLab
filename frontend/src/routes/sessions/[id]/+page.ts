import { getSessionAPI } from '$lib/api/sessions';
import {
	getTasksAPI,
	getTaskStatusCompletedFromStudentAPI,
	getTaskStatusFromSessionAPI
} from '$lib/api/tasks';
import Session from '$lib/types/session';
import Task, { TaskStatus } from '$lib/types/tasks';
import { error, type Load } from '@sveltejs/kit';

export const load: Load = async ({ params, fetch, data }) => {
	const jwt = data?.jwt;

	const id = params.id;
	if (!id) {
		error(404, 'Not found');
	}

	const nid = parseInt(id);
	if (isNaN(nid)) {
		error(404, 'Not found');
	}

	const session = Session.parse(await getSessionAPI(fetch, nid));
	if (!session) {
		error(404, 'Not found');
	}

	await session.loadMessages(fetch);

	const tasksRaw = await getTasksAPI(fetch);
	const tasks = Task.parseAll(tasksRaw);

	let currentTask: Task | null = null;

	const sessionTaskStatusRaw = await getTaskStatusFromSessionAPI(fetch, nid);
	if (sessionTaskStatusRaw) {
		const sessionTaskStatus = TaskStatus.parse(sessionTaskStatusRaw);
		if (sessionTaskStatus && sessionTaskStatus.status == 'start') {
			const task = tasks.find((task) => task.id === sessionTaskStatus.task_id);
			if (task) currentTask = task;
		}
	}

	let completedTasks: Task[] = [];

	if (session.student) {
		const completedTasksStatusRaw = await getTaskStatusCompletedFromStudentAPI(
			fetch,
			session.student.id
		);
		if (completedTasksStatusRaw) {
			const completedTasksStatus = TaskStatus.parseAll(completedTasksStatusRaw);
			completedTasks = completedTasksStatus
				.map((taskStatus) => tasks.find((task) => task.id === taskStatus.task_id))
				.filter((task) => task !== undefined) as Task[];
		}
	}

	return { session, jwt, tasks, currentTask, completedTasks };
};
