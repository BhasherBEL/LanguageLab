import { axiosInstance } from './apiInstance';

export async function getSessionsAPI() {
	const response = await axiosInstance.get(`/sessions`);

	return response.data;
}

export async function createSessionAPI() {
	const response = await axiosInstance.post(`/sessions`);
}
