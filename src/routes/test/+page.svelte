<script>
	// @ts-nocheck

	import SurveyNode from '$lib/SurveyNode.svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	function next() {}

	let context = {
		uid: 'test-survey-uid',
		started_at: '2024-01-01 00:00:00'
	};
</script>

<div class="viewport typo" data-testid="survey-container">
	{#each data.post.content as page, i}
		<div class="view" data-testid="page-{i}">
			<div class="view-body">
				{#each page.children as node}
					<SurveyNode {node} bind:context {next} />
				{/each}
			</div>
		</div>
	{/each}
</div>
