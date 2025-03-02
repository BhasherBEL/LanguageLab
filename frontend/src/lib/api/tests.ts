import type { fetchType } from '$lib/utils/types';

export async function sendTestResponseAPI(
	fetch: fetchType,
	code: string,
	user_id: number | null,
	test_task_id: number,
	test_group_id: number,
	test_question_id: number,
	response_time: number,
	qcm_selected_id: number | null,
	gapfill_text: string | null
) {
	const body = {
		code,
		user_id,
		test_task_id,
		test_group_id,
		test_question_id,
		response_time,
		entry_qcm: null as null | { selected_id: number },
		entry_gapfill: null as null | { text: string }
	};

	if (qcm_selected_id !== null) {
		body.entry_qcm = { selected_id: qcm_selected_id };
	}

	if (gapfill_text !== null) {
		body.entry_gapfill = { text: gapfill_text };
	}

	const response = await fetch(`/api/tests/entries`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});

	return response.ok;
}
