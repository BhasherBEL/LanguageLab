import { getAxiosInstance } from './apiInstance';

export async function sendTestVocabularyAPI(session: string, data: any): Promise<boolean> {
	const response = await getAxiosInstance(session).post(`/tests/vocabulary`, { content: data });

	if (response.status !== 201) {
		return false;
	}

	return true;
}
