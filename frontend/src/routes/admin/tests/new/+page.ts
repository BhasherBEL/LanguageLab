import { getTestGroupsAPI } from '$lib/api/tests';
import TestTaskGroup from '$lib/types/testTaskGroups';
import { type Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const groupsRaw = await getTestGroupsAPI(fetch);
	const groups = TestTaskGroup.parseAll(groupsRaw);

	return { possibleGroups: groups };
};
