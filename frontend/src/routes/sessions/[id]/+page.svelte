<script lang="ts">
	import { t } from '$lib/services/i18n';
	import type { PageData } from './$types.js';
	import WeeklySurvey from './WeeklySurvey.svelte';
	import Chatbox from './Chatbox.svelte';
	import FeedbackSidebar from './FeedbackSidebar.svelte';
	import type Task from '$lib/types/tasks';
	import { toastAlert, toastSuccess } from '$lib/utils/toasts';
	import { sendTaskStatusAPI } from '$lib/api/tasks';
	import { Icon, ChatBubbleLeft } from 'svelte-hero-icons';

	let { data }: { data: PageData } = $props();
	let user = data.user!;
	let { session, jwt, tasks, completedTasks } = data;
	let { onlineUsers } = session;

	let level = $state('all');
	let currentTask: Task | null = $state(data.currentTask);
	let taskInProgress: boolean = $state(data.currentTask !== null);
	let sidebarOpen = $state(true); // Track sidebar state

	let availableLevels = new Set(tasks.map((task: Task) => task.level));

	// Function to toggle the sidebar
	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

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

<div class="h-full flex flex-row bg-gray-50 relative">
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
		lg:text-lg transition-all duration-300 ease-in-out hidden lg:block peer-checked:block flex-shrink-0"
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

		{#if !taskInProgress || !currentTask}
			{#if user.is_tutor}
				<h2 class="text-lg truncate font-semibold text-gray-700 text-center border-t pt-4 mt-4">
					🎯 {$t('tasks.title')}
				</h2>
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
				<button class="btn mt-2 w-full btn-primary" onclick={startTask}>
					{$t('tasks.startTask')}
				</button>
			{/if}
		{:else}
			<p class="mt-4 font-bold">
				🎯 {$t('tasks.taskInProgress')}:
			</p>
			<p>
				{currentTask.shortTitle}
			</p>
			{#if user.is_tutor}
				{#if currentTask.instructions}
					<p>
						{currentTask.instructions}
					</p>
				{/if}
				{#if currentTask.examples}
					<p class="mt-2 text-sm">
						{currentTask.examples}
					</p>
				{/if}
				<div class="flex gap-2 mt-4">
					<button class="btn flex-grow" onclick={cancelTask}>
						🔙 {$t('button.cancel')}
					</button>
					<button class="btn btn-primary flex-grow" onclick={finishTask}>
						✔️ {$t('tasks.achieveTask')}
					</button>
				</div>
			{:else if currentTask.learnerInstructions}
				<p>
					{currentTask.learnerInstructions}
				</p>
			{/if}
		{/if}
	</div>

	<div class="flex flex-grow relative overflow-hidden">
		<!-- Chat area -->
		<div class="flex-grow transition-all duration-300 ease-in-out relative min-w-0" 
			 style={`margin-right: ${sidebarOpen ? '350px' : '0px'}`}>
			{#if !sidebarOpen}
				<button 
					class="absolute top-4 right-4 z-20 btn btn-primary btn-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
					onclick={toggleSidebar}
					aria-label={$t('session.feedback.show')}
					title={$t('session.feedback.show')}
				>
					<Icon src={ChatBubbleLeft} size="16" />
					<span class="font-medium hidden sm:inline">{$t('session.feedback.show')}</span>
				</button>
			{/if}
			<Chatbox {session} {jwt} {user} />
		</div>
		
		<!-- Feedback sidebar -->
		<div class="absolute top-0 right-0 h-full w-[350px] transition-transform duration-300 ease-in-out overflow-hidden border-l border-base-300 bg-base-100" 
			 class:translate-x-0={sidebarOpen}
			 class:translate-x-full={!sidebarOpen}>
			<FeedbackSidebar 
				{session} 
				{user}
				isOpen={sidebarOpen}
				onToggle={toggleSidebar} 
			/>
		</div>
	</div>
</div>

<WeeklySurvey {user} />
