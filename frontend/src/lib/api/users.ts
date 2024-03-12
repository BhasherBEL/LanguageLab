import { axiosInstance } from './apiInstance';

export async function getUsersAPI() {
	const response = await axiosInstance.get(`/users`);

	return response.data;
}
