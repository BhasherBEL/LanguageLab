<script>
	export let values;
	export let option;
	export let placeholder;
	export let funct;
</script>

<select
	class="w-full select select-bordered !ml-0"
	id="dropdown"
	name="dropdown"
	bind:value={option}
	on:change={() => funct()}
	required
>
	<option value="" disabled selected>{placeholder}</option>
	{#each values as { value, display }}
		<option {value}>{display}</option>
	{/each}
</select>
