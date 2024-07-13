import sanitizeHtml from 'sanitize-html';

export function sanitize(html: string): string {
	return sanitizeHtml(html, {
		allowedTags: [],
		allowedAttributes: {}
	});
}
