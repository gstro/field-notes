<script lang="ts">
	let { fieldNotes }: { fieldNotes: Record<string, unknown> } = $props();
	const items = $derived(
		[
			{ v: fieldNotes.coffeePriceUsd != null ? `$${fieldNotes.coffeePriceUsd}` : null, l: 'Drip Coffee' },
			{ v: fieldNotes.eggsDozenUsd != null ? `$${fieldNotes.eggsDozenUsd}` : null, l: 'Dozen Eggs' },
			{ v: fieldNotes.parkingEase != null ? `${fieldNotes.parkingEase}/5` : null, l: 'Parking Ease' },
			{ v: fieldNotes.tapWater != null ? `${fieldNotes.tapWater}/5` : null, l: 'Tap Water' },
			{ v: fieldNotes.strangerFriendliness != null ? `${fieldNotes.strangerFriendliness}/5` : null, l: 'Strangers' },
			{ v: fieldNotes.bartenderAskedWhereFrom == null ? null : fieldNotes.bartenderAskedWhereFrom ? 'Yes' : 'No', l: 'Bartender Asked' }
		].filter((i) => i.v != null)
	);
</script>

{#if items.length}
	<div class="field-notes">
		{#each items as i}
			<div class="fn"><span class="v">{i.v}</span><span class="l">{i.l}</span></div>
		{/each}
	</div>
{/if}

<style>
	.field-notes { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; }
	.fn { text-align: center; }
	.v { font-family: var(--font-mono); font-size: 1.15rem; font-weight: 500; color: var(--cream); display: block; }
	.l { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-top: 3px; display: block; }
</style>
