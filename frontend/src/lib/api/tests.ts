import type { fetchType } from '$lib/utils/types';

export async function sendTestEntryTaskQcmAPI(
	fetch: fetchType,
	code: string,
	rid: string | null,
	user_id: number | null,
	test_id: number,
	study_id: number,
	test_group_id: number,
	test_question_id: number,
	response_time: number,
	selected_id: number
) {
	const response = await fetch(`/api/tests/entries`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			code,
			rid,
			user_id,
			test_id,
			study_id,
			entry_task: {
				test_group_id,
				test_question_id,
				response_time,
				entry_task_qcm: {
					selected_id
				}
			}
		})
	});

	return response.ok;
}

export async function sendTestEntryTaskGapfillAPI(
	fetch: fetchType,
	code: string,
	rid: string | null,
	user_id: number | null,
	test_id: number,
	test_group_id: number,
	study_id: number,
	test_question_id: number,
	response_time: number,
	text: string
) {
	const response = await fetch(`/api/tests/entries`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			code,
			rid,
			user_id,
			test_id,
			study_id,
			entry_task: {
				test_group_id,
				test_question_id,
				response_time,
				entry_task_gapfill: {
					text
				}
			}
		})
	});

	return response.ok;
}

export async function sendTestEntryTypingAPI(
	fetch: fetchType,
	code: string,
	rid: string | null,
	user_id: number | null,
	test_id: number,
	study_id: number,
	position: number,
	downtime: number,
	uptime: number,
	key_code: number,
	key_value: string
) {
	const response = await fetch(`/api/tests/entries`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			code,
			rid,
			user_id,
			test_id,
			study_id,
			entry_typing: {
				position,
				downtime,
				uptime,
				key_code,
				key_value
			}
		})
	});

	return response.ok;
}

export async function getTestEntriesScoreAPI(
	fetch: fetchType,
	rid: string
): Promise<number | null> {
	const response = await fetch(`/api/tests/entries/score/${rid}`);

	if (!response.ok) return null;
	const scoreText = await response.text();

	const score = parseFloat(scoreText);

	if (isNaN(score)) return null;

	return score;
}

export async function createTestTypingAPI(
	fetch: fetchType,
	title: string,
	explanation: string,
	text: string,
	repeat: number,
	duration: number
) {
	const response = await fetch(`/api/tests`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			title,
			test_typing: {
				explanations: explanation,
				text,
				repeat,
				duration
			}
		})
	});
	if (!response.ok) return null;
	const test = await response.json();
	return test.id;
}

export async function updateTestTypingAPI(
	fetch: fetchType,
	id: number,
	title: string,
	explanation: string,
	text: string,
	repeat: number,
	duration: number
): Promise<boolean> {
	const response = await fetch(`/api/tests/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			title,
			test_typing: {
				explanations: explanation,
				text,
				repeat,
				duration
			}
		})
	});

	return response.ok;
}

export async function deleteTestAPI(fetch: fetchType, id: number): Promise<boolean> {
	const response = await fetch(`/api/tests/${id}`, {
		method: 'DELETE'
	});
	if (!response.ok) return false;
	return true;
}
