import { getTestGroupsAPI } from '$lib/api/tests';
import { type Load } from '@sveltejs/kit';
import TestTaskGroup from '$lib/types/testTaskGroups';

export const load: Load = async ({ fetch }) => {
	const groupsRaw = await getTestGroupsAPI(fetch);
	const groups = TestTaskGroup.parseAll(groupsRaw);

	return {
		groups
	};
};
