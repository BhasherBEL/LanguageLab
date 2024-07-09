<script lang="ts">
	import { t } from '$lib/services/i18n';

	export let timeslots: bigint;

	function compute(event: InputEvent & { target: HTMLInputElement }) {
		const element = event.target as HTMLInputElement;
		timeslots ^= BigInt(1) << BigInt(parseInt(element.name));
	}

	function isChecked(i: number, j: number): boolean {
		let timeslot: bigint = 1n << BigInt(i * 7 + j + 1);
		let newtimeslots: bigint = timeslots & timeslot;
		return newtimeslots !== 0n;
	}
</script>

<table class="table table-fixed text-center">
	<thead class="text-wrap">
		<tr>
			<td class="w-32">{$t('timeslots.cesttime')}</td>
			<td>{$t('utils.days.monday')}</td>
			<td>{$t('utils.days.tuesday')}</td>
			<td>{$t('utils.days.wednesday')}</td>
			<td>{$t('utils.days.thursday')}</td>
			<td>{$t('utils.days.friday')}</td>
			<td>{$t('utils.days.saturday')}</td>
			<td>{$t('utils.days.sunday')}</td>
		</tr>
	</thead>
	<tbody>
		{#each Array.from({ length: 8 }, (_, i) => i) as i}
			<tr>
				<th class="text-xs">{(i * 2 + 8) % 24}h - {(i * 2 + 10) % 24}h</th>
				{#each Array.from({ length: 7 }, (_, j) => j) as j}
					<td>
						<input
							type="checkbox"
							class="checkbox"
							checked={isChecked(i, j)}
							name={(i * 7 + j + 1).toString()}
							on:input={compute}
						/>
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
