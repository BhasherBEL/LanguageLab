import { axiosInstance } from './apiInstance';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendTestVocabularyAPI(data: any): Promise<boolean> {
	const response = await axiosInstance.post(`/tests/vocabulary`, { content: data });

	if (response.status !== 201) {
		return false;
	}

	return true;
}
