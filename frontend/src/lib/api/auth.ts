import session from '$lib/stores/session';
import { setAuthTokens } from 'axios-jwt';
import { axiosPublicInstance } from './apiInstance';
import { jwtDecode } from 'jwt-decode';
import { type JWTContent } from '$lib/utils/login';

export async function loginAPI(username: string, password: string) {
	const response = await axiosPublicInstance.post(
		`/auth/login`,
		{
			username,
			password
		},
		{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}
	);

	if (response.status === 401) {
		return response.data.detail ?? 'Unauthorized';
	} else if (response.status === 422) {
		return 'Invalid request';
	} else if (response.status === 200) {
		session.accessToken.set(response.data.access_token);
		session.refreshToken.set(response.data.refresh_token);

		setAuthTokens({
			accessToken: response.data.access_token,
			refreshToken: response.data.refresh_token
		});

		const decoded = jwtDecode<JWTContent>(response.data.access_token);

		session.username.set(decoded.username);
		session.type.set(decoded.type.toFixed(0));
		session.id.set(decoded.sub);

		return 'OK';
	}

	return 'Unknown error occurred';
}