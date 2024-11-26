// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User?;
			jwt: string?;
			locale: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface FormData {
			message: string;
		}
	}
}

export {};
