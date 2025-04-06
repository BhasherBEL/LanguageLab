import { Test } from '$lib/types/tests';
import { error, type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, params }) => {
	const id = Number(params.id);

	if (isNaN(id)) {
		return error(400, 'Invalid ID');
	}

	const testRaw = await (await fetch(`/api/tests/${id}`)).json();
	const test = Test.parse(testRaw);

	return { test };
};
