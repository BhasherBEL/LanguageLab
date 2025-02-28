<script lang="ts">
	import { t } from '$lib/services/i18n';
	import { TestTask, TestTyping } from '$lib/types/tests';

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

<ul class="w-full">
	{#each items as item}
		<input type="hidden" {name} value={item.id} />
	{/each}
	{#each items as item, index}
		<li
			class="p-3 bg-gray-200 border rounded-md select-none
        transition-transform ease-out duration-200 flex mb-2
        {index === draggedIndex ? 'opacity-50 bg-gray-300' : ''}
        {index === overIndex ? 'border-dashed border-2 border-blue-500' : ''}"
		>
			<div class="w-full">
				{#if item instanceof TestTask}
					{item.title} ({item.groups.length}
					{$t('utils.words.groups')}, {item.numQuestions}
					{$t('utils.words.questions')})
				{:else if item instanceof TestTyping}
					{item.title}
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
