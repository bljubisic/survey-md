<script lang="ts" context="module">
	// @ts-nocheck

	/**
	 * @param {{ children: any; value: any; }} node
	 */
	function flatten(node: { children: any; value: any }) {
		return (node.children || [])
			.reduce(
				(
					text: string,
					/** @type {{ children: any; value: any; }} */ node: { children: any; value: any }
				) => text + ' ' + flatten(node),
				node.value || ''
			)
			.trim();
	}

	/**
	 * @param {string | any[]} array
	 */
	function shuffleArray(array: string | any[]) {
		for (let i = array.length - 1, j; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			// @ts-ignore
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
</script>

<script lang="ts">
	import SurveyNode from './SurveyNode.svelte';

	export let context: any;
	export let node: any;
	export let next = () => {};

	const { params } = node.question;
	if (node.type === 'list' && params && params.shuffle) {
		shuffleArray(node.children);
	}
	const multi = node.type === 'list' && params && (params.min || params.max);
	let matrix = node.type === 'list' && params && params.matrix && params.matrix.split(',');
	const textValues = node.children.map(flatten);

	let checked: { [key: string | number]: any} = {};
	const selected = context[node.question.name];

	if (selected === undefined) {
		context[node.question.name] = null;
	}

	// Initialize all checked values to false (or populate from selected)
	if (matrix) {
		textValues.forEach((_v: any, i: string | number) => {
			matrix.forEach((_m: any, j: number) => {
				checked[i + '.' + j] = false;
			});
		});
	} else {
		textValues.forEach((_v: any, i: string | number) => {
			checked[i] = false;
		});
	}

	if (Array.isArray(selected)) {
		textValues.forEach((v: any, i: string | number) => {
			// @ts-ignore
			checked[i] = selected.includes(v);
		});
	} else if (selected) {
		const selectedIndex = textValues.indexOf(selected);
		if (selectedIndex >= 0) {
			checked[selectedIndex] = true;
		}
	}

	const className = params.class || '';

	// Force reactivity when checked changes
	$: checkedState = { ...checked };

	/**
	 * @param {number} i
	 */
	function check(i: string | number, j: number | undefined = undefined) {
		if (multi) {
			// @ts-ignore
			if (checked[i]) {
				// @ts-ignore
				checked[i] = false;
			} else {
				const { max } = params;
				const count = Object.values(checked).filter(Boolean).length;
				if (max && count + 1 <= max) {
					// @ts-ignore
					checked[i] = true;
				}
			}
			// Trigger reactivity for multi-select
			checked = { ...checked };
		} else if (matrix) {
			if (!checked[i + '.' + j]) {
				if (
					Object.keys(checked).filter((key) => key.includes(i + '.') && checked[key] === true)
						.length === 0
				) {
					// @ts-ignore
					checked[i + '.' + j] = true;
				} else {
					Object.keys(checked)
						.filter((key) => key.includes(i + '.'))
						.forEach((key) => {
							checked[key] = false;
						});
					checked[i + '.' + j] = true;
				}
			}
			// Trigger reactivity for matrix
			checked = { ...checked };
		} else {
			// Single-select: set all to false, then set selected to true
			const newChecked: { [key: string | number]: boolean } = {};
			textValues.forEach((_v: any, idx: number) => {
				newChecked[idx] = idx === i;
			});
			checked = newChecked;
		}
		// @ts-ignore
		const val = textValues.filter((_v: any, i: string | number) => !!checked[i]);
		if (multi) {
			const min = params.min || 0;
			save(val.length >= min ? val : []);
		} else if (matrix) {
			save(val);
		} else {
			save(val[0]);
		}
	}

	/**
	 * @param {any} val
	 */
	function save(val: any) {
		context[node.question.name] = val;
		// Trigger Svelte reactivity by creating new object reference
		context = { ...context };
	}

	const qname = node.question.name;

	// Handle text input changes to trigger reactivity
	function handleInput() {
		context = { ...context };
	}
</script>

{#if node.type === 'list'}
	{#if matrix !== undefined && matrix.length > 0}
		<ul
			id={qname}
			class:matrix={matrix && !className}
			style="--size:{matrix ? matrix.length + 1 : 0}"
			class={className}
		>
			<div class="matrixli">
				<div class="matrixTxt">
					<p />
				</div>
				{#each matrix as matrixLeg, i}
					<div class="matrixTxt">
						<p>{matrixLeg}</p>
					</div>
				{/each}
				{#each node.children as child, i}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
					<div class="matrixTxt">
						<SurveyNode node={{ ...child.children[0], type: 'text' }} {context} {next} />
					</div>
					{#each matrix as nonused, j}
						<div class:single={true && !className}>
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
							<li
								on:click={() => check(i, j)}
								class:single={false && !className}
								class={className}
								class:checked={checkedState[i + '.' + j]}
								role="checkbox"
								aria-checked={checkedState[i + '.' + j]}
							/>
						</div>
					{/each}
				{/each}
			</div>
		</ul>
	{:else}
		<ul
			id={qname}
			class:multi={multi && !className}
			class:single={!multi && !className}
			class={className}
		>
			{#each node.children as child, i}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
				<li
					on:click={() => check(i)}
					class:checked={checkedState[i]}
					role="checkbox"
					aria-checked={checkedState[i]}
				>
					<SurveyNode node={{ ...child.children[0], type: 'text' }} {context} {next} />
				</li>
			{/each}
		</ul>
	{/if}
{:else if node.type === 'paragraph'}
	<p id={qname} class="input {className}">
		{#if params.rows}
			<textarea
				rows={params.rows}
				placeholder={flatten(node)}
				bind:value={context[node.question.name]}
				on:input={handleInput}
			/>
		{:else if !isNaN(params.min) || !isNaN(params.max)}
			<input
				type="number"
				min={params.min}
				max={params.max}
				placeholder={flatten(node)}
				bind:value={context[node.question.name]}
				on:input={handleInput}
			/>
		{:else if params.email}
			<input
				type="email"
				placeholder={flatten(node)}
				bind:value={context[node.question.name]}
				on:input={handleInput}
			/>
		{:else}
			<input
				type="text"
				placeholder={flatten(node)}
				bind:value={context[node.question.name]}
				on:input={handleInput}
			/>
		{/if}
	</p>
{/if}

<style>
	.single {
		list-style-type: none;
		padding-left: 0;
	}
	.single > li {
		cursor: pointer;
		margin: 0.4em 0;
	}
	.single > li:before {
		box-sizing: border-box;
		display: inline-block;
		content: '';
		vertical-align: middle;
		width: 0.8em;
		height: 0.8em;
		border: 1px solid rgba(0, 0, 0, 0.7);
		border-radius: 100%;
		margin-right: 0.5em;
	}
	.single > li.checked:before {
		background-color: rgba(0, 0, 0, 0.7);
		box-shadow: inset 0 0 0 0.1em #fff;
	}
	.multi {
		list-style-type: none;
		padding-left: 0;
	}
	.multi > li {
		cursor: pointer;
		margin: 0.4em 0;
	}
	.multi > li:before {
		box-sizing: border-box;
		display: inline-block;
		content: ' ';
		vertical-align: middle;
		text-align: center;
		width: 0.8em;
		height: 0.8em;
		border: 1px solid rgba(0, 0, 0, 0.7);
		border-radius: 2px;
		margin-right: 0.5em;
		line-height: 0.4em;
	}
	.multi > li.checked:before {
		content: '✓';
	}
	.matrix {
		display: grid;
		grid-template-columns: repeat(var(--size), 1fr);
	}

	.matrixli {
		display: grid;
		grid-template-columns: repeat(var(--size), 1fr);
		gap: 10px;
	}

	.matrixTxt {
		margin-right: 5px;
	}

	.input input,
	.input textarea {
		display: block;
		font: inherit;
		font-size: inherit;
		line-height: inherit;
		padding: 0.2em;
		width: 100%;
		box-sizing: border-box;
		border: 1px solid rgba(0, 0, 0, 0.7);
		border-radius: 2px;
	}
	.input input[type='number'] {
		display: inline-block;
		width: auto;
	}
</style>
