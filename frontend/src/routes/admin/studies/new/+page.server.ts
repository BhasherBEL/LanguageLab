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
		const studyOrganisation = formData.get('StudyOrganisation')?.toString();
		const studyAddress = formData.get('StudyAddress')?.toString();
		const studyContact = formData.get('StudyContact')?.toString();
		const studyPIemail = formData.get('StudyPIemail')?.toString();

		if (
			!title ||
			!startDateStr ||
			!endDateStr ||
			!nbSessionStr ||
			!consentParticipation ||
			!consentPrivacy ||
			!consentRights ||
			!studyOrganisation ||
			!studyAddress ||
			!studyContact ||
			!studyPIemail
		) {
			return {
				message: 'Invalid request: Missing required fields'
			};
		}

		if (description === undefined) {
			description = '';
		}

		const startDate = new Date(startDateStr);
		const endDate = new Date(endDateStr);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return {
				message: 'Invalid request: Invalid dates'
			};
		}

		const nbSession = parseInt(nbSessionStr, 10);
		if (isNaN(nbSession)) {
			return {
				message: 'Invalid request: Invalid number of sessions'
			};
		}

		if (startDate.getTime() > endDate.getTime()) {
			return {
				message: 'End date cannot be before start date'
			};
		}

		const tests = formData
			.getAll('tests[]')
			.map((test) => {
				try {
					return JSON.parse(test.toString());
				} catch (e) {
					return null;
				}
			})
			.filter((test) => test !== null);

		const user_ids = formData.getAll('users[]').map((user) => parseInt(user.toString(), 10));

		const id = await createStudyAPI(
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
			studyOrganisation,
			studyAddress,
			studyContact,
			studyPIemail,
			user_ids
		);

		if (id === null) {
			return {
				message: 'Failed to create study'
			};
		}

		return redirect(303, '/admin/studies');
	}
};
