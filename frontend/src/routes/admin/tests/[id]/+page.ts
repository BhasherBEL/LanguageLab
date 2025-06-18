import { getTestAPI, getTestGroupsAPI } from '$lib/api/tests';
import { Test } from '$lib/types/tests';
import TestTaskGroup from '$lib/types/testTaskGroups';
import { error, type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, params }) => {
	const id = Number(params.id);

	if (isNaN(id)) {
		return error(400, 'Invalid ID');
	}

	const testRaw = await getTestAPI(fetch, id);
	const test = Test.parse(testRaw);

	const groupsRaw = await getTestGroupsAPI(fetch);
	const groups = TestTaskGroup.parseAll(groupsRaw);

	return { test, possibleGroups: groups };
};
