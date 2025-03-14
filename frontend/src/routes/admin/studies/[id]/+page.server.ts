import { patchStudyAPI } from '$lib/api/studies';
import { redirect, type Actions } from '@sveltejs/kit';
import { formatToUTCDate } from '$lib/utils/date';

export const actions: Actions = {
	default: async ({ request, fetch, params }) => {
		const formData = await request.formData();
		const studyId = params.id;

		if (!studyId) return { message: 'Invalid study ID' };

		const title = formData.get('title')?.toString();
		const description = formData.get('description')?.toString() || '';
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
			return { message: 'Invalid request: : Missing required fields' };
		}

		const startDate = new Date(startDateStr);
		const endDate = new Date(endDateStr);
		const nbSession = parseInt(nbSessionStr, 10);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(nbSession)) {
			return { message: 'Invalid date or session amount' };
		}

		if (startDate.getTime() > endDate.getTime()) {
			return { message: 'End time cannot be before start time' };
		}

		const test_ids = formData
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

		const updated = await patchStudyAPI(fetch, parseInt(studyId, 10), {
			title: title,
			description: description,
			start_date: formatToUTCDate(startDate),
			end_date: formatToUTCDate(endDate),
			nb_session: nbSession,
			test_ids,
			consent_participation: consentParticipation,
			consent_privacy: consentPrivacy,
			consent_rights: consentRights,
			study_data_organisation: studyOrganisation,
			study_data_address: studyAddress,
			study_data_contact: studyContact,
			study_data_email: studyPIemail,
			user_ids
		});
		if (!updated) return { message: 'Failed to update study' };

		return redirect(303, '/admin/studies');
	}
};
