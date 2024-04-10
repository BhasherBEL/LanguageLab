<script lang="ts">
	import { t } from '$lib/services/i18n';

	export let timeslots: number;

	function compute(event: InputEvent & { target: HTMLInputElement }) {
		const element = event.target as HTMLInputElement;
		timeslots ^= 1 << parseInt(element.name);
	}
</script>

<table class="w-full table-fixed text-center border-collapse">
	<tr class="h-12 bg-gray-100 font-bold">
		<td class="border-2">{$t('timeslots.cesttime')}</td>
		<td class="border-2">{$t('utils.days.monday')}</td>
		<td class="border-2">{$t('utils.days.tuesday')}</td>
		<td class="border-2">{$t('utils.days.wednesday')}</td>
		<td class="border-2">{$t('utils.days.thursday')}</td>
		<td class="border-2">{$t('utils.days.friday')}</td>
	</tr>
	{#each Array.from({ length: 5 }, (_, i) => i) as i}
		<tr>
			<td class="h-12 border-2 bg-gray-100 font-bold">{i * 2 + 8}:30 - {i * 2 + 10}:30</td>
			{#each Array.from({ length: 5 }, (_, j) => j) as j}
				<td class="h-12 border-2">
					<input
						type="checkbox"
						checked={(1 << (i * 5 + j + 1)) & timeslots ? true : false}
						name={(i * 5 + j + 1).toString()}
						class="w-full h-full"
						on:input={compute}
					/>
				</td>
			{/each}
		</tr>
	{/each}
</table>
