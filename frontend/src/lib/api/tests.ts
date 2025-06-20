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

export async function getTestAPI(fetch: fetchType, id: number): Promise<any> {
	const response = await fetch(`/api/tests/${id}`);
	if (!response.ok) return null;
	const test = await response.json();
	return test;
}

export async function getTestGroupsAPI(fetch: fetchType): Promise<any> {
	const response = await fetch(`/api/tests/groups`);
	if (!response.ok) return null;
	const groups = await response.json();
	return groups;
}

export async function getTestTaskGroupAPI(fetch: fetchType, id: number): Promise<any> {
	const response = await fetch(`/api/tests/groups/${id}`);
	if (!response.ok) return null;
	const group = await response.json();
	return group;
}

export async function getTestQuestionsAPI(fetch: fetchType): Promise<any> {
	const response = await fetch(`/api/tests/questions`);
	if (!response.ok) return null;
	const questions = await response.json();
	return questions;
}

export async function createTestTaskAPI(
	fetch: fetchType,
	title: string,
	groups: number[]
): Promise<number | null> {
	const response = await fetch(`/api/tests`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			title,
			test_task: {
				groups
			}
		})
	});
	if (!response.ok) return null;
	const test = await response.json();
	return test.id;
}

export async function updateTestTaskAPI(
	fetch: fetchType,
	id: number,
	title: string,
	groups: number[]
): Promise<boolean> {
	const response = await fetch(`/api/tests/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			title,
			test_task: {
				groups
			}
		})
	});
	return response.ok;
}

export async function createTestTaskGroupAPI(
	fetch: fetchType,
	title: string,
	demo: boolean,
	randomize: boolean,
	questions: number[]
): Promise<number | null> {
	const response = await fetch(`/api/tests/groups`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			title,
			demo,
			randomize,
			questions
		})
	});
	if (!response.ok) return null;
	const group = await response.json();
	return group.id;
}

export async function updateTestTaskGroupAPI(
	fetch: fetchType,
	id: number,
	title: string,
	demo: boolean,
	randomize: boolean,
	questions: number[]
): Promise<boolean> {
	const response = await fetch(`/api/tests/groups/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			title,
			demo,
			randomize,
			questions
		})
	});
	return response.ok;
}

export async function getTestQuestionAPI(fetch: fetchType, id: number): Promise<any> {
	const response = await fetch(`/api/tests/questions/${id}`);
	if (!response.ok) return null;
	const question = await response.json();
	return question;
}

export async function createTestQuestionQcmAPI(
	fetch: fetchType,
	question: string,
	options: string[],
	correct: number
): Promise<number | null> {
	const response = await fetch(`/api/tests/questions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			question,
			question_qcm: {
				correct,
				...Object.assign({}, ...options.map((option, i) => ({ [`option${i + 1}`]: option })))
			}
		})
	});
	if (!response.ok) return null;
	const questionData = await response.json();
	return questionData.id;
}

export async function createTestQuestionGapfillAPI(
	fetch: fetchType,
	question: string
): Promise<number | null> {
	const response = await fetch(`/api/tests/questions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			question
		})
	});
	if (!response.ok) return null;
	const questionData = await response.json();
	return questionData.id;
}

export async function updateTestQuestionQcmAPI(
	fetch: fetchType,
	id: number,
	question: string,
	options: string[],
	correct: number
): Promise<boolean> {
	const body = {
		question,
		question_qcm: {
			correct,
			...Object.assign({}, ...options.map((option, i) => ({ [`option${i + 1}`]: option })))
		}
	};

	console.log(body);

	const response = await fetch(`/api/tests/questions/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	return response.ok;
}

export async function updateTestQuestionGapfillAPI(
	fetch: fetchType,
	id: number,
	question: string
): Promise<boolean> {
	const response = await fetch(`/api/tests/questions/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			question
		})
	});
	return response.ok;
}

export async function deleteTestQuestionAPI(fetch: fetchType, id: number): Promise<boolean> {
	const response = await fetch(`/api/tests/questions/${id}`, {
		method: 'DELETE'
	});
	return response.ok;
}
