<script lang="ts">
	import { t } from '$lib/services/i18n';
	import type { PageData } from './$types.js';
	import WeeklySurvey from './WeeklySurvey.svelte';
	import Chatbox from './Chatbox.svelte';

	let { data }: { data: PageData } = $props();
	let user = data.user!;
	let { session, jwt } = data;
	let { onlineUsers } = session;
</script>

<div class="h-full flex flex-col lg:flex-row pt-2 lg:pt-0 bg-gray-50 relative">
	<input type="checkbox" id="toggleParticipants" class="hidden peer" />

	<label
		for="toggleParticipants"
		class="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded-md shadow-md
		hover:bg-yellow-600 transition focus:outline-none text-sm lg:hidden"
	>
		{$t('utils.words.toggle')}
	</label>

	<div
		class="group w-full max-w-md bg-white border rounded-lg shadow-md p-6 mx-4 my-2 h-fit text-base
		lg:text-lg transition-all duration-300 ease-in-out hidden lg:block peer-checked:block"
	>
		<h2 class="text-xl truncate font-semibold text-gray-700 text-center mb-4">
			{$t('utils.words.participants')}
		</h2>

		<div class="space-y-4">
			{#each session.users as sessionUser (sessionUser.id)}
				<div class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition">
					<div
						class="w-10 h-10 rounded-full overflow-hidden shadow-md"
						title={sessionUser.nickname}
					>
						<img
							src={`https://gravatar.com/avatar/${sessionUser.emailHash}?d=identicon`}
							alt={sessionUser.nickname}
							class="rounded-full border-2 {sessionUser.id == user?.id ||
							$onlineUsers.has(sessionUser.id)
								? 'border-green-500'
								: 'border-red-500'}"
						/>
					</div>
					<span class="truncate w-48 lg:w-64 font-medium text-gray-800">
						{sessionUser.nickname}
					</span>
				</div>
			{/each}
		</div>

		<h2 class="text-lg truncate font-semibold text-gray-700 text-center border-t pt-4 mt-4">
			{$t('utils.words.topics')}
		</h2>
		<p class="text-center truncate text-sm text-neutral-500 italic">
			{$t('session.noTopic')}
		</p>
	</div>

	<div class="flex flex-row flex-grow col-span-5">
		<Chatbox {session} {jwt} {user} />
	</div>
</div>

<WeeklySurvey {user} />
