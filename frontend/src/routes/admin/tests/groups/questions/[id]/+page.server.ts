import { redirect, type Actions } from '@sveltejs/kit';
import { updateTestQuestionQcmAPI, updateTestQuestionGapfillAPI } from '$lib/api/tests';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		const idStr = formData.get('id')?.toString();
		const questionType = formData.get('questionType')?.toString();
		const questionValue = formData.get('question')?.toString();

		if (!idStr || !questionType || !questionValue) {
			return {
				message: 'Invalid request: Missing required fields'
			};
		}

		const id = parseInt(idStr, 10);
		if (isNaN(id)) {
			return {
				message: 'Invalid request: Invalid ID'
			};
		}

		let success = false;

		if (questionType === 'qcm') {
			const qcmSubType = formData.get('qcmSubType')?.toString();
			const options = formData
				.getAll('options[]')
				.map((opt) => opt.toString())
				.filter((opt) => opt.trim() !== '');
			const correctStr = formData.get('correct')?.toString();

			if (!qcmSubType || options.length < 2 || !correctStr) {
				return {
					message: 'Invalid request: Missing QCM fields'
				};
			}

			const correct = parseInt(correctStr, 10);
			if (isNaN(correct) || correct < 0 || correct >= options.length) {
				return {
					message: 'Invalid request: Invalid correct answer index'
				};
			}

			const question = `${qcmSubType}:${questionValue}`;
			const formattedOptions = options.map((opt) => `text:${opt}`);

			success = await updateTestQuestionQcmAPI(fetch, id, question, formattedOptions, correct);
		} else if (questionType === 'gapfill') {
			const question = questionValue.startsWith('text:') ? questionValue : `text:${questionValue}`;
			success = await updateTestQuestionGapfillAPI(fetch, id, question);
		}

		if (!success) {
			return {
				message: 'Error updating test question'
			};
		}

		return redirect(303, `/admin/tests/groups/questions`);
	}
};
