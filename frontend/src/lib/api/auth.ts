import session from '$lib/stores/JWTSession';
import { setAuthTokens } from 'axios-jwt';
import { axiosPublicInstance } from './apiInstance';
import { jwtDecode } from 'jwt-decode';
import { type JWTContent } from '$lib/utils/login';
import User from '$lib/types/user';

export async function loginAPI(email: string, password: string): Promise<string> {
	return axiosPublicInstance
		.post(
			`/auth/login`,
			{
				email,
				username: email,
				password
			},
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}
		)
		.then((response) => {
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

				session.email.set(decoded.email);
				session.nickname.set(decoded.nickname);
				session.type.set(decoded.type.toFixed(0));
				session.id.set(decoded.sub);
				session.exp.set(decoded.exp.toFixed(0));

				return 'OK';
			}

			return 'Unknown error occurred: ' + response.status;
		})
		.catch((error) => {
			return error.toString();
		});
}
