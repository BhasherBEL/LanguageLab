<script lang="ts">
	import { t } from '$lib/services/i18n';
	import Survey from '$lib/types/survey';
	import autosize from 'svelte-autosize';

	let { items = $bindable(), name } = $props();
	let draggedIndex: number | null = $state(null);
	let overIndex: number | null = $state(null);

	const handleDragStart = (index: number) => {
		draggedIndex = index;
	};

	const handleDragOver = (index: number, event: DragEvent) => {
		event.preventDefault();
		overIndex = index;
	};

	const handleDrop = (index: number) => {
		if (draggedIndex !== null && draggedIndex !== index) {
			const reordered = [...items];
			const [removed] = reordered.splice(draggedIndex, 1);
			reordered.splice(index, 0, removed);
			items = reordered;
		}
		draggedIndex = null;
		overIndex = null;
	};

	const handleDragEnd = () => {
		draggedIndex = null;
		overIndex = null;
	};

	const deleteItem = (index: number) => {
		items = items.filter((_, i) => i !== index);
	};
</script>

<ul class="space-y-2">
	{#each items as item}
		{#if item instanceof Survey}
			<input type="hidden" {name} value={JSON.stringify({ type: 'survey', id: item.id })} />
		{:else}
			<input type="hidden" {name} value={JSON.stringify({ type: 'typing' })} />
		{/if}
	{/each}
	{#each items as item, index}
		<li
			class="p-3 bg-gray-200 border rounded-md select-none
        transition-transform ease-out duration-200 flex
        {index === draggedIndex ? 'opacity-50 bg-gray-300' : ''}
        {index === overIndex ? 'border-dashed border-2 border-blue-500' : ''}"
		>
			<div class="flex-grow">
				{#if item instanceof Survey}
					{item.title} ({item.groups.length}
					{$t('utils.words.groups')}, {item.nQuestions}
					{$t('utils.words.questions')})
				{:else}
					<div class="mb-2">{item.name}</div>
					<label class="label" for="typing_input">Text*</label>
					<textarea
						use:autosize
						class="input w-full max-h-52"
						id="typing_input"
						name="typing_input"
						bind:value={item.text}
						required
					></textarea>
					<div class="flex items-center gap-2">
						<label class="label" for="typing_repetition">Number of time to repeat</label>
						<input
							class="input w-20"
							type="number"
							id="typing_repetition"
							name="typing_repetition"
							bind:value={item.repetition}
						/>
						and/or
						<label class="label" for="typing_time">Duration (in seconds)</label>
						<input
							class="input w-20"
							type="number"
							id="typing_time"
							name="typing_time"
							bind:value={item.duration}
						/>
					</div>
				{/if}
			</div>
			<div
				class="ml-4 flex flex-col gap-1 cursor-grab"
				draggable="true"
				ondragstart={() => handleDragStart(index)}
				ondragover={(e) => handleDragOver(index, e)}
				ondrop={() => handleDrop(index)}
				ondragend={handleDragEnd}
				role="button"
				tabindex="0"
			>
				<div class="flex gap-1">
					<span class="w-2 h-2 bg-gray-400 rounded-full"></span>
					<span class="w-2 h-2 bg-gray-400 rounded-full"></span>
				</div>
				<div class="flex gap-1">
					<span class="w-2 h-2 bg-gray-400 rounded-full"></span>
					<span class="w-2 h-2 bg-gray-400 rounded-full"></span>
				</div>
				<div class="flex gap-1">
					<span class="w-2 h-2 bg-gray-400 rounded-full"></span>
					<span class="w-2 h-2 bg-gray-400 rounded-full"></span>
				</div>
			</div>
			<div>
				<button
					type="button"
					class="ml-4 p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
					onclick={(e) => {
						e.preventDefault();
						deleteItem(index);
					}}
					aria-label="Delete"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</li>
	{/each}
</ul>
