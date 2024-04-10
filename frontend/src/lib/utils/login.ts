export function getBaseURL(): string {
	return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
}

export interface JWTContent {
	sub: string;
	type: number;
	exp: number;
	email: string;
	nickname: string;
	is_active: boolean;
}
