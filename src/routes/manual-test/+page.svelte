<script>
	// Minimal reproduction test
	let checked = {
		0: false,
		1: false,
		2: false
	};

	let checkedState = {};
	$: checkedState = { ...checked };

	function check(i) {
		console.log('✅ check called for index:', i);
		console.log('before:', checked);
		// Set all to false, then set selected to true
		const newChecked = {};
		options.forEach((_, idx) => {
			newChecked[idx] = idx === i;
		});
		checked = newChecked;
		console.log('after:', checked);
		alert(`Clicked index ${i}! Check console for logs.`);
	}

	const options = ['Red', 'Green', 'Blue'];

	// Debug: log when component mounts
	import { onMount } from 'svelte';
	onMount(() => {
		console.log('✅ Component mounted successfully');
		console.log('Initial checked:', checked);
	});
</script>

<div style="padding: 2rem;">
	<h1>Manual Test - Radio Button Click</h1>

	<h2>Test 1: Using checked directly</h2>
	<ul style="list-style: none; padding: 0;">
		{#each options as option, i}
			<li
				on:click={() => check(i)}
				style="cursor: pointer; padding: 0.5rem; background: {checked[i] ? 'lightgreen' : 'white'}; border: 1px solid black; margin: 0.5rem 0;"
				role="checkbox"
				aria-checked={checked[i]}
			>
				{option} - checked[{i}] = {checked[i]} - aria-checked = {checked[i]}
			</li>
		{/each}
	</ul>

	<h2>Test 2: Using checkedState reactive</h2>
	<ul style="list-style: none; padding: 0;">
		{#each options as option, i}
			<li
				on:click={() => check(i)}
				style="cursor: pointer; padding: 0.5rem; background: {checkedState[i] ? 'lightblue' : 'white'}; border: 1px solid black; margin: 0.5rem 0;"
				role="checkbox"
				aria-checked={checkedState[i]}
			>
				{option} - checkedState[{i}] = {checkedState[i]} - aria-checked = {checkedState[i]}
			</li>
		{/each}
	</ul>

	<h2>Debug Info</h2>
	<pre>checked: {JSON.stringify(checked, null, 2)}</pre>
	<pre>checkedState: {JSON.stringify(checkedState, null, 2)}</pre>

	<p>
		<strong>Instructions:</strong> Click on any option above. If it works correctly, you should see:
		<br />
		1. The background color change
		<br />
		2. The text showing the new checked value
		<br />
		3. Console logs in the browser dev tools
		<br />
		4. The debug info update
	</p>

	<p style="margin-top: 2rem;">
		<a href="/test" style="padding: 0.5rem 1rem; background: #0066cc; color: white; text-decoration: none;">
			Go to Full Test Page
		</a>
	</p>
</div>
