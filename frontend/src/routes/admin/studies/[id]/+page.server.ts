import { patchStudyAPI } from '$lib/api/studies';
import { redirect, type Actions } from '@sveltejs/kit';
import { formatToUTCDate } from '$lib/utils/date';

export const actions: Actions = {
	default: async ({ request, fetch, params }) => {
		const formData = await request.formData();
		const studyId = params.id;

		console.log('here');

		if (!studyId) return { message: 'Invalid study ID' };

		const title = formData.get('title')?.toString();
		const description = formData.get('description')?.toString() || '';
		const startDateStr = formData.get('startDate')?.toString();
		const endDateStr = formData.get('endDate')?.toString();
		const chatDurationStr = formData.get('chatDuration')?.toString();
		const consentParticipation = formData.get('consentParticipation')?.toString();
		const consentPrivacy = formData.get('consentPrivacy')?.toString();
		const consentRights = formData.get('consentRights')?.toString();
		const consentStudyData = formData.get('consentStudyData')?.toString();

		console.log('here1');

		if (
			!title ||
			!startDateStr ||
			!endDateStr ||
			!chatDurationStr ||
			!consentParticipation ||
			!consentPrivacy ||
			!consentRights ||
			!consentStudyData
		) {
			return { message: 'Invalid request' };
		}

		const startDate = new Date(startDateStr);
		const endDate = new Date(endDateStr);
		const chatDuration = parseInt(chatDurationStr, 10);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(chatDuration)) {
			return { message: 'Invalid date or chat duration' };
		}

		if (startDate.getTime() > endDate.getTime()) {
			return { message: 'End time cannot be before start time' };
		}

		const tests = formData
			.getAll('tests')
			.map((test) => {
				try {
					return JSON.parse(test.toString());
				} catch (e) {
					return null;
				}
			})
			.filter((test) => test !== null);

		console.log('here2');

		const updated = await patchStudyAPI(fetch, parseInt(studyId, 10), {
			title: title,
			description: description,
			start_date: formatToUTCDate(startDate),
			end_date: formatToUTCDate(endDate),
			chat_duration: chatDuration,
			tests: tests,
			consent_participation: consentParticipation,
			consent_privacy: consentPrivacy,
			consent_rights: consentRights,
			consent_study_data: consentStudyData
		});

		console.log('here3');
		console.log(updated);

		if (!updated) return { message: 'Failed to update study' };

		console.log('Action executed');
		console.log('here4');
		return redirect(303, '/admin/studies');
	}
};
