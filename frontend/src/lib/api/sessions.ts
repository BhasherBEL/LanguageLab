import { formatToUTCDate } from '$lib/utils/date';
import type { fetchType } from '$lib/utils/types';

export async function getSessionsAPI(fetch: fetchType): Promise<any[]> {
	const response = await fetch(`/api/sessions`);
	if (!response.ok) return [];

	return await response.json();
}

export async function createSessionAPI(fetch: fetchType): Promise<any | null> {
	const response = await fetch(`/api/sessions`, { method: 'POST' });
	if (!response.ok) return null;

	return await response.json();
}

export async function getSessionAPI(fetch: fetchType, id: number): Promise<any | null> {
	const response = await fetch(`/api/sessions/${id}`);
	if (!response.ok) return null;

	return await response.json();
}

export async function deleteSessionAPI(fetch: fetchType, id: number): Promise<boolean> {
	const response = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
	if (!response.ok) return false;

	return true;
}

export async function getMessagesAPI(fetch: fetchType, id: number): Promise<any | null> {
	const response = await fetch(`/api/sessions/${id}/messages`);
	if (!response.ok) return null;

	return await response.json();
}

export async function createMessageAPI(
	fetch: fetchType,
	id: number,
	content: string,
	metadata: { message: string; date: number }[],
	replyTo: string | null
): Promise<any | null> {
	const response = await fetch(`/api/sessions/${id}/messages`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ content, metadata, reply_to_message_id: replyTo })
	});
	if (!response.ok) return null;

	return await response.json();
}

export async function createAIMessageAPI(
    fetch: fetchType,
    sessionId: string,
    content: string
): Promise<any | null> {
    const response = await fetch(`/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            role: "user",
            content: content
        })
    });

    if (!response.ok) return null;

    return await response.json();
}

export async function updateMessageAPI(
	fetch: fetchType,
	id: number,
	message_id: string,
	content: string,
	metadata: { message: string; date: number }[]
): Promise<any | null> {
	const response = await fetch(`/api/sessions/${id}/messages`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ message_id, content, metadata })
	});
	if (!response.ok) return null;

	return await response.json();
}

export async function createMessageFeedbackAPI(
	fetch: fetchType,
	id: number,
	message_id: number,
	start: number,
	end: number,
	content: string | null
): Promise<number | null> {
	const response = await fetch(`/api/sessions/${id}/messages/${message_id}/feedback`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ start, end, content })
	});
	if (!response.ok) return null;

	return parseInt(await response.text());
}

export async function deleteMessageFeedbackAPI(
	fetch: fetchType,
	id: number,
	message_id: number,
	feedback_id: number
): Promise<boolean> {
	const response = await fetch(
		`/api/sessions/${id}/messages/${message_id}/feedback/${feedback_id}`,
		{
			method: 'DELETE'
		}
	);

	return response.ok;
}

export async function patchLanguageAPI(
	fetch: fetchType,
	id: number,
	language: string
): Promise<boolean> {
	const response = await fetch(`/api/sessions/${id}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ language })
	});

	return response.ok;
}

export async function createSessionSatisfyAPI(
	fetch: fetchType,
	id: number,
	usefullness: number,
	easiness: number,
	remarks: string
): Promise<boolean> {
	const response = await fetch(`/api/sessions/${id}/satisfy`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ usefullness, easiness, remarks })
	});

	return response.ok;
}

export async function createSessionFromCalComAPI(
	fetch: fetchType,
	user_id: number,
	contact_id: number,
	start: Date,
	end: Date
): Promise<number | null> {
	const response = await fetch(`/api/users/${user_id}/contacts/${contact_id}/bookings`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			start_time: formatToUTCDate(start),
			end_time: formatToUTCDate(end)
		})
	});
	if (!response.ok) return null;

	return await response.json();
}

export async function addUserToSessionAPI(
	fetch: fetchType,
	session_id: number,
	user_id: number
): Promise<boolean> {
	const response = await fetch(`/api/sessions/${session_id}/users/${user_id}`, { method: 'POST' });

	return response.ok;
}

export async function patchSessionAPI(fetch: fetchType, id: number, data: any): Promise<boolean> {
	const response = await fetch(`/api/sessions/${id}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	return response.ok;
}

export async function sendTypingAPI(fetch: fetchType, id: number): Promise<boolean> {
	const response = await fetch(`/api/sessions/${id}/typing`, { method: 'POST' });
	return response.ok;
}

export async function sendPresenceAPI(fetch: fetchType, id: number): Promise<boolean> {
	const response = await fetch(`/api/sessions/${id}/presence`, { method: 'POST' });
	return response.ok;
}

export async function removeUserFromSessionAPI(
	fetch: fetchType,
	session_id: number,
	user_id: number
): Promise<boolean> {
	const response = await fetch(`/api/sessions/${session_id}/users/${user_id}`, {
		method: 'DELETE'
	});
	return response.ok;
}
