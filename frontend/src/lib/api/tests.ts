export async function sendTestVocabularyAPI(data: any): Promise<boolean> {
	const response = await fetch(`/api/tests/vocabulary`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});

	return response.ok;
}
