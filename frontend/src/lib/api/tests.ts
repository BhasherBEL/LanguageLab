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
