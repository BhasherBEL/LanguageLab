import axios from 'axios';
import {
	applyAuthTokenInterceptor,
	getBrowserLocalStorage,
	type IAuthTokens,
	type TokenRefreshRequest
} from 'axios-jwt';

export const API_URL = 'http://localhost:8000/api/v1';

export const axiosPublicInstance = axios.create({
	...axios.defaults,
	baseURL: API_URL,
	validateStatus: () => true,
	headers: {
		'Content-Type': 'application/json'
	}
});

export const axiosInstance = axios.create({
	...axios.defaults,
	baseURL: API_URL,
	validateStatus: () => true,
	headers: {
		'Content-Type': 'application/json'
	}
});

const requestRefresh: TokenRefreshRequest = async (
	refreshToken: string
): Promise<IAuthTokens | string> => {
	const response = await axios.post(`${API_URL}/auth/refresh`, { token: refreshToken });

	return {
		accessToken: response.data.access_token,
		refreshToken: response.data.refresh_token
	};
};

applyAuthTokenInterceptor(axiosInstance, { requestRefresh });

const getStorage = getBrowserLocalStorage;

applyAuthTokenInterceptor(axiosInstance, { requestRefresh, getStorage });
