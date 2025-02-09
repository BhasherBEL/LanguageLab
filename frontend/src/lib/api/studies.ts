import { formatToUTCDate } from '$lib/utils/date';
import type { fetchType } from '$lib/utils/types';

export async function getStudiesAPI(fetch: fetchType): Promise<any[]> {
	const response = await fetch('/api/studies');
	if (!response.ok) return [];
	return await response.json();
}

export async function getStudyAPI(fetch: fetchType, id: number): Promise<any | undefined> {
	const response = await fetch(`/api/studies/${id}`);
	if (!response.ok) return;
	return await response.json();
}

export async function deleteStudyAPI(fetch: fetchType, id: number): Promise<boolean> {
	const response = await fetch(`/api/studies/${id}`, {
		method: 'DELETE'
	});
	return response.ok;
}

export async function createStudyAPI(
	fetch: fetchType,
	title: string,
	description: string,
	startDate: Date,
	endDate: Date,
	chatDuration: number,
	tests: { type: string; id?: number }[]
): Promise<number | null> {
	const response = await fetch('/api/studies', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			title,
			description,
			start_date: formatToUTCDate(startDate),
			end_date: formatToUTCDate(endDate),
			chat_duration: chatDuration,
			tests
		})
	});
	if (!response.ok) return null;
	return parseInt(await response.text());
}

export async function patchStudyAPI(
	fetch: fetchType,
	study_id: number,
	data: any
): Promise<boolean> {
	const response = await fetch(`/api/studies/${study_id}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	return response.ok;
}

export async function addUserToStudyAPI(
	fetch: fetchType,
	study_id: number,
	user_id: number
): Promise<boolean> {
	const response = await fetch(`/api/studies/${study_id}/users/${user_id}`, {
		method: 'POST'
	});
	return response.ok;
}

export async function removeUserToStudyAPI(
	fetch: fetchType,
	study_id: number,
	user_id: number
): Promise<boolean> {
	const response = await fetch(`/api/studies/${study_id}/users/${user_id}`, {
		method: 'DELETE'
	});
	return response.ok;
}

export async function createTestTypingAPI(
	fetch: fetchType,
	entries: typingEntry[],
	code: string
): Promise<number | null> {
	const response = await fetch(`/api/studies/typing`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ entries, code })
	});

	if (!response.ok) return null;

	return parseInt(await response.text());
}
