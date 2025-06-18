import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const agentId = parseInt(params.id);

	if (isNaN(agentId)) {
		throw redirect(303, '/admin/agents');
	}

	const response = await fetch(`/api/users/${agentId}`);
	if (!response.ok) {
		throw redirect(303, '/admin/agents');
	}

	const agentUser = await response.json();

	// Ensure it's an agent user
	if (!agentUser.agent_user) {
		throw redirect(303, '/admin/agents');
	}

	return {
		agentUser
	};
};

export const actions: Actions = {
	default: async ({ request, fetch, params }) => {
		const agentId = parseInt(params.id);
		const data = await request.formData();
		const nickname = data.get('nickname') as string;
		const model = data.get('model') as string;
		const system_prompt = data.get('system_prompt') as string;
		const is_in_pool = data.get('is_in_pool') === 'on';
		const is_active = data.get('is_active') === 'on';

		if (!nickname || !model || !system_prompt) {
			return fail(400, {
				error: 'All fields are required',
				nickname,
				model,
				system_prompt,
				is_in_pool,
				is_active
			});
		}

		const response = await fetch(`/api/users/${agentId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				nickname: nickname.trim(),
				is_active,
				agent_user: {
					model: model.trim(),
					system_prompt: system_prompt.trim(),
					is_in_pool
				}
			})
		});

		if (!response.ok) {
			return fail(500, {
				error: 'Failed to update agent',
				nickname,
				model,
				system_prompt,
				is_in_pool,
				is_active
			});
		}

		// Redirect to agents page after successful update
		throw redirect(303, '/admin/agents');
	}
};
