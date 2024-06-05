import axios from 'axios';
import config from '$lib/config';

export const axiosPublicInstance = axios.create({
	...axios.defaults,
	baseURL: config.API_URL,
	withCredentials: true,
	validateStatus: () => true,
	headers: {
		'Content-Type': 'application/json'
	}
});

export const getAxiosInstance = (access_cookie: string) =>
	axios.create({
		...axios.defaults,
		baseURL: config.API_URL,
		withCredentials: true,
		validateStatus: () => true,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${access_cookie}`
		}
	});
