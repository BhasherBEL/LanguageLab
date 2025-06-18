import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(`/api/users`);
	if (!response.ok) {
		return { agents: [] };
	}

	const users = await response.json();
	// Filter only agent users
	const agents = users.filter((user: any) => user.agent_user !== null);

	return {
		agents
	};
};

export const actions: Actions = {
	delete: async ({ request, fetch }) => {
		const data = await request.formData();
		const agent_id = parseInt(data.get('agent_id') as string);

		const response = await fetch(`/api/users/${agent_id}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			return fail(500, {
				error: 'Failed to delete agent',
				agent_id
			});
		}

		// Redirect to refresh the page and show updated data
		throw redirect(303, '/admin/agents');
	}
};
