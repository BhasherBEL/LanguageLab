import type { fetchType } from '$lib/utils/types';

export async function createTaskAPI(
	fetch: fetchType,
	level: string,
	shortTitle: string,
	instructions: string,
	learnerInstructions: string,
	examples: string
): Promise<number | undefined> {
	const response = await fetch(`/api/tasks`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			level,
			shortTitle,
			instructions,
			learnerInstructions,
			examples
		})
	});

	if (!response.ok) return;

	return parseInt(await response.text());
}

export async function getTasksAPI(fetch: fetchType) {
	const response = await fetch('/api/tasks');
	if (!response.ok) return null;
	return await response.json();
}

export async function getTaskAPI(fetch: fetchType, task_id: number) {
	const response = await fetch(`/api/tasks/${task_id}`);
	if (!response.ok) return null;
	return await response.json();
}

export async function updateTaskAPI(
	fetch: fetchType,
	task_id: number,
	level: string,
	shortTitle: string,
	instructions: string,
	learnerInstructions: string,
	examples: string
): Promise<boolean> {
	const response = await fetch(`/api/tasks/${task_id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			level,
			shortTitle,
			instructions,
			learnerInstructions,
			examples
		})
	});
	return response.ok;
}

export async function deleteTaskAPI(fetch: fetchType, task_id: number): Promise<boolean> {
	const response = await fetch(`/api/tasks/${task_id}`, {
		method: 'DELETE'
	});
	return response.ok;
}
