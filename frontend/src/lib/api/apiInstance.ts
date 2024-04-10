import axios from 'axios';
import config from '$lib/config';

export const axiosPublicInstance = axios.create({
	...axios.defaults,
	baseURL: config.API_URL,
	validateStatus: () => true,
	headers: {
		'Content-Type': 'application/json'
	}
});

export const axiosInstance = axiosPublicInstance;
