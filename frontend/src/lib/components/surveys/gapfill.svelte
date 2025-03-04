<script lang="ts">
	export let length;
	export let onInput: (value: string) => void;
	let content: string = '';
</script>

<span class="relative text-blue-500 font-mono tracking-[0.2em] px-1"
	><!--
	--><input
		class="absolute bg-transparent text-transparent w-full caret-blue-500 focus:outline-none focus:ring-0"
		bind:value={content}
		on:input={(event) => onInput(event.target.value)}
		maxlength={length}
	/><!-- -->{#each Array.from({ length }) as _, i}
		<label>{content[i] || '_'}</label>
	{/each}
</span>
