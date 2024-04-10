import { axiosPublicInstance } from './apiInstance';

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
				console.log(response);
				return 'OK';
			}

			return 'Unknown error occurred: ' + response.status;
		})
		.catch((error) => {
			return error.toString();
		});
}

export async function registerAPI(
	email: string,
	password: string,
	nickname: string
): Promise<string> {
	return axiosPublicInstance
		.post(
			`/auth/register`,
			{
				email,
				username: email,
				password,
				nickname
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
			} else if (response.status === 201) {
				return 'OK';
			}

			return 'Error ' + response.status + ': ' + response.data.detail;
		})
		.catch((error) => {
			return error.toString();
		});
}
