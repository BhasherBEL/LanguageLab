import { getUsersAPI } from '$lib/api/users';
import User from '$lib/types/user';
import { type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const users = User.parseAll(await getUsersAPI(fetch));

	return {
		users
	};
};
