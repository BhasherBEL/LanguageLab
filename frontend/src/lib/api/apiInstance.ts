import axios from 'axios';
import config from '$lib/config';
import { writable, get } from 'svelte/store';

export const access_cookie = writable('');

export const axiosPublicInstance = axios.create({
	...axios.defaults,
	baseURL: config.API_URL,
	withCredentials: true,
	validateStatus: () => true,
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${get(access_cookie)}`
	}
});

export const axiosInstance = axiosPublicInstance;
