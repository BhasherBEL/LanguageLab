import axios from 'axios';
import {
	applyAuthTokenInterceptor,
	getBrowserLocalStorage,
	type IAuthTokens,
	type TokenRefreshRequest
} from 'axios-jwt';
import session from '$lib/stores/JWTSession';
import { jwtDecode } from 'jwt-decode';
import type { JWTContent } from '$lib/utils/login';

export const API_URL = 'http://localhost:8000/api/v1';
export const WS_URL = 'ws://localhost:8000/api/v1/ws';

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
	return axiosPublicInstance
		.post(`auth/refresh`, { token: refreshToken })

		.then((response) => {
			if (response.status === 401) {
				return response.data.detail ?? 'Unauthorized';
			} else if (response.status === 422) {
				return 'Invalid request';
			} else if (response.status === 200) {
				session.accessToken.set(response.data.access_token);
				session.refreshToken.set(response.data.refresh_token);

				const decoded = jwtDecode<JWTContent>(response.data.access_token);

				session.email.set(decoded.email);
				session.type.set(decoded.type.toFixed(0));
				session.id.set(decoded.sub);
				session.exp.set(decoded.exp.toFixed(0));
			}

			return {
				accessToken: response.data.access_token,
				refreshToken: response.data.refresh_token
			};
		})
		.catch((error) => {
			return error.toString();
		});
};

applyAuthTokenInterceptor(axiosInstance, { requestRefresh });
