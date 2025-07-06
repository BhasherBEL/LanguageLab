//source: shuffle function code taken from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array/18650169#18650169
export function shuffle(array: any[]) {
	let currentIndex = array.length;
	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
}

export function seededRandom(seed: number): number {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

export function shuffleWithSeed(array: any[], seed: number): any[] {
	const optionsWithRandom = array.map((item, index) => ({
		item,
		random: seededRandom(seed + index)
	}));
	const shuffled = optionsWithRandom.sort((a, b) => a.random - b.random).map(({ item }) => item);
	return shuffled;
}
