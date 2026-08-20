<script lang="ts">
	import { page } from '$app/state';
</script>
<main style="max-width:600px;margin:0 auto;padding:4rem 2rem;font-family:var(--font-mono)">
	<h1 style="font-family:var(--font-display);font-size:3rem">{page.status}</h1>
	<p>{page.error?.message}</p>
	<a href="/" style="color:var(--gold)">← Home</a>
</main>
