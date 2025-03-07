export default class SurveyTypingSvelte {
	name: string = 'Typing Test';
	text: string = $state('');
	repetition: number = $state(0);
	duration: number = $state(0);
}
