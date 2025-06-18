import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
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

		const response = await fetch(`/api/users`, {
			method: 'POST',
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
				error: 'Failed to create agent',
				nickname,
				model,
				system_prompt,
				is_in_pool,
				is_active
			});
		}

		// Redirect to agents page after successful creation
		throw redirect(303, '/admin/agents');
	}
};
