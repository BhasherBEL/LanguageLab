<script lang="ts">
	import { t } from '$lib/services/i18n';
	import type { PageData } from './$types.js';
	import WeeklySurvey from './WeeklySurvey.svelte';
	import Chatbox from './Chatbox.svelte';
	import type Task from '$lib/types/tasks';
	import { toastAlert, toastSuccess } from '$lib/utils/toasts';
	import { sendTaskStatusAPI } from '$lib/api/tasks';

	let { data }: { data: PageData } = $props();
	let user = data.user!;
	let { session, jwt, tasks, completedTasks } = data;
	let { onlineUsers } = session;

	let level = $state('all');
	let currentTask: Task | null = $state(data.currentTask);
	let taskInProgress: boolean = $state(data.currentTask !== null);

	let availableLevels = new Set(tasks.map((task: Task) => task.level));

	async function startTask() {
		const student = session.student;
		if (!student || !currentTask) return;
		const ok = await sendTaskStatusAPI(
			fetch,
			'start',
			student.id,
			user.id,
			currentTask.id,
			session.id
		);
		if (!ok) {
			toastAlert($t('tasks.statusFail'));
			return;
		}
		taskInProgress = true;
	}

	async function cancelTask() {
		const student = session.student;
		if (!student || !currentTask) return;
		const ok = await sendTaskStatusAPI(
			fetch,
			'cancel',
			student.id,
			user.id,
			currentTask.id,
			session.id
		);
		if (!ok) {
			toastAlert($t('tasks.statusFail'));
			return;
		}
		taskInProgress = false;
		currentTask = null;
	}

	async function finishTask() {
		const student = session.student;
		if (!student || !currentTask) return;
		const ok = await sendTaskStatusAPI(
			fetch,
			'finish',
			student.id,
			user.id,
			currentTask.id,
			session.id
		);
		if (!ok) {
			toastAlert($t('tasks.statusFail'));
			return;
		}
		completedTasks.push(currentTask);

		taskInProgress = false;
		currentTask = null;
		toastSuccess($t('tasks.taskFinished'));
	}
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
			{$t('utils.words.tasks')}
		</h2>
		{#if !taskInProgress || !currentTask}
			{#if user.is_tutor}
				<div class="flex gap-2">
					<select class="select select-bordered w-32" bind:value={level}>
						<option value="all">{$t('utils.words.all')}</option>
						{#each availableLevels as l}
							<option value={l}>{l}</option>
						{/each}
					</select>
					<select class="select select-bordered flex-1 overflow-hidden" bind:value={currentTask}>
						{#each availableLevels as l}
							{#if level === 'all' || l === level}
								<optgroup label={l}>
									{#each tasks.filter((task: Task) => task.level === l) as task (task.id)}
										<option value={task}>
											{#if completedTasks.includes(task)}
												✓
											{/if}
											{task.shortTitle}
										</option>
									{/each}
								</optgroup>
							{/if}
						{/each}
					</select>
				</div>
			{/if}
			<button class="btn mt-2 w-full btn-primary" onclick={startTask}>
				{$t('button.select')}
			</button>
		{:else}
			<p class="mt-4 font-bold">
				{$t('tasks.taskInProgress')}:
			</p>
			<p>
				{currentTask.shortTitle}
			</p>
			{#if currentTask.instructions}
				<p class="mt-2 font-bold">
					{$t('utils.words.instructions')}:
				</p>
				<p>
					{currentTask.instructions}
				</p>
			{/if}
			<p class="mt-2 font-bold">
				{$t('utils.words.examples')}:
			</p>
			<p>
				{currentTask.examples}
			</p>
			<div class="flex gap-2 mt-4">
				<button class="btn flex-grow" onclick={cancelTask}>
					{$t('button.cancel')}
				</button>
				<button class="btn btn-primary flex-grow" onclick={finishTask}>
					{$t('button.finish')}
				</button>
			</div>
		{/if}
	</div>

	<div class="flex flex-row flex-grow col-span-5">
		<Chatbox {session} {jwt} {user} />
	</div>
</div>

<WeeklySurvey {user} />
