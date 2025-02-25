import { createStudyAPI } from '$lib/api/studies';
import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		const title = formData.get('title')?.toString();
		let description = formData.get('description')?.toString();
		const startDateStr = formData.get('startDate')?.toString();
		const endDateStr = formData.get('endDate')?.toString();
		const nbSessionStr = formData.get('nbSession')?.toString();

		const consentParticipation = formData.get('consentParticipation')?.toString();
		const consentPrivacy = formData.get('consentPrivacy')?.toString();
		const consentRights = formData.get('consentRights')?.toString();
		const consentStudyData = formData.get('consentStudyData')?.toString();

		if (
			!title ||
			!startDateStr ||
			!endDateStr ||
			!nbSessionStr ||
			!consentParticipation ||
			!consentPrivacy ||
			!consentRights ||
			!consentStudyData
		) {
			return {
				message: 'Invalid request 1'
			};
		}

		if (description === undefined) {
			description = '';
		}

		const startDate = new Date(startDateStr);
		const endDate = new Date(endDateStr);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return {
				message: 'Invalid request 2'
			};
		}

		const nbSession = parseInt(nbSessionStr, 10);
		if (isNaN(nbSession)) {
			return {
				message: 'Invalid request 3'
			};
		}

		if (startDate.getTime() > endDate.getTime()) {
			return {
				message: 'End time cannot be before start time'
			};
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

		await createStudyAPI(
			fetch,
			title,
			description,
			startDate,
			endDate,
			nbSession,
			tests,
			consentParticipation,
			consentPrivacy,
			consentRights,
			consentStudyData
		);

		return redirect(303, '/admin/studies');
	}
};
