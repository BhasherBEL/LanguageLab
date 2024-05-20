<script lang="ts">
	import { t } from '$lib/services/i18n';

	export let timeslots: number;

	function compute(event: InputEvent & { target: HTMLInputElement }) {
		const element = event.target as HTMLInputElement;
		timeslots ^= 1 << parseInt(element.name);
	}
</script>

<table class="table table-fixed">
	<thead class="text-wrap">
		<tr>
			<td class="w-30">{$t('timeslots.cesttime')}</td>
			<td>{$t('utils.days.monday')}</td>
			<td>{$t('utils.days.tuesday')}</td>
			<td>{$t('utils.days.wednesday')}</td>
			<td>{$t('utils.days.thursday')}</td>
			<td>{$t('utils.days.friday')}</td>
			<!-- <td>{$t('utils.days.saturday')}</td>
			<td>{$t('utils.days.sunday')}</td> -->
		</tr>
	</thead>
	<tbody>
		{#each Array.from({ length: 5 }, (_, i) => i) as i}
			<tr>
				<th class="text-xs">{i * 2 + 8}:30 - {i * 2 + 10}:30</th>
				{#each Array.from({ length: 5 }, (_, j) => j) as j}
					<td>
						<input
							type="checkbox"
							class="checkbox"
							checked={(1 << (i * 5 + j + 1)) & timeslots ? true : false}
							name={(i * 5 + j + 1).toString()}
							on:input={compute}
						/>
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
