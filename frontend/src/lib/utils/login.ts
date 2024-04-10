export function getBaseURL(): string {
	return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
}

export interface JWTContent {
	subject: any;
	type: number;
	exp: number;
	iat: number;
}
