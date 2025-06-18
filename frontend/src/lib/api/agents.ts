import type { fetchType } from '$lib/utils/types';

export async function getAgentsAPI(fetch: fetchType): Promise<any[]> {
	const response = await fetch(`/api/users`);
	if (!response.ok) return [];

	const users = await response.json();
	// Filter only agent users
	return users.filter((user: any) => user.agent_user !== null);
}

export async function createAgentAPI(
	fetch: fetchType,
	nickname: string,
	model: string,
	system_prompt: string,
	is_in_pool: boolean = false,
	is_active: boolean = true
): Promise<number | null> {
	const response = await fetch(`/api/users`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			nickname,
			is_active,
			agent_user: {
				model,
				system_prompt,
				is_in_pool
			}
		})
	});

	if (!response.ok) return null;

	return parseInt(await response.text());
}

export async function updateAgentAPI(
	fetch: fetchType,
	user_id: number,
	data: {
		nickname?: string;
		is_active?: boolean;
		agent_user?: {
			model?: string;
			system_prompt?: string;
			is_in_pool?: boolean;
		};
	}
): Promise<boolean> {
	const response = await fetch(`/api/users/${user_id}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	return response.ok;
}

export async function deleteAgentAPI(fetch: fetchType, user_id: number): Promise<boolean> {
	const response = await fetch(`/api/users/${user_id}`, {
		method: 'DELETE'
	});
	return response.ok;
}
