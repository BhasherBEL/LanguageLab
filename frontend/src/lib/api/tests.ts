import { axiosInstance } from './apiInstance';

export async function sendTestVocabularyAPI(data: any): Promise<boolean> {
	const response = await axiosInstance.post(`/tests/vocabulary`, { content: data });

	if (response.status !== 201) {
		return false;
	}

	return true;
}
