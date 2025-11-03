<script context="module">
	/**
	 * @param {string} html
	 */
	function matchHead(html) {
		return html.match(/^<head>([\s\S]*)<\/head>$/i);
	}

	/**
	 * @param {any} sel
	 */
	function runScripts(sel) {
		Array.from(document.querySelectorAll(sel)).forEach((/** @type {any} */ node) => {
			if (node._started) return;
			node._started = true;
			const s = document.createElement('script');
			if (node.src) {
				s.src = node.src;
			} else {
				s.appendChild(document.createTextNode(node.innerHTML));
			}
			node.parentNode.insertBefore(s, node);
		});
	}

	/**
	 * @param {string | string[]} str
	 * @param {{ [x: string]: any; }} ctx
	 */
	function inlinePrints(str, ctx) {
		const strValue = Array.isArray(str) ? str[0] || '' : str;
		return strValue.replace(
			/\{ *([^ }]+) *\}/g,
			(/** @type {string} */ _, /** @type {string} */ key) =>
				key in ctx && ctx[key] !== null ? ctx[key] : ''
		);
	}

	/**
	 * @param {string | string[]} url
	 */
	function getUrlString(url) {
		return Array.isArray(url) ? url[0] || '' : url;
	}
</script>

<script>
	import { onMount } from 'svelte';
	import SurveyQuestion from './SurveyQuestion.svelte';
	import SurveyPrint from './SurveyPrint.svelte';
	import { createFunction } from './expressions';

	/**
	 * @type {{ [x: string]: any; }}
	 */
	export let context;
	/**
	 * @type {{ condition: { expr: any; }; type: string; value: string; question: any; depth: number; children: any; url: string | string[]; alt: any; }}
	 */
	export let node;
	export let next = (/** @type {string | string[]} */ _url) => {};

	/**
	 * @type {((arg0: { [x: string]: any; }) => boolean) | null}
	 */
	let cond = null;
	if (node.condition) {
		// @ts-ignore
		cond = createFunction(node.condition.expr);
	}

	let cond_value = false;
	$: try {
		cond_value = cond ? cond(context) : true;
	} catch (e) {
		cond_value = false;
	}

	/**
	 * @type {string | null}
	 */
	let head = null;
	if (node.type === 'html') {
		/*
        // Do we need this? Scripts run twice because of SSR
        node.value = node.value.replace(/<script([^>]*)>/gi, "<script$1 data-s>");
        onMount(() => runScripts("script[data-s]"));
      */
		let m = matchHead(node.value);
		if (m) {
			head = m[1];
		}
	}
</script>

<svelte:head>
	{#if head && cond_value}
		{@html head}
	{/if}
</svelte:head>

{#if cond_value}
	{#if head}
		<!-- head -->
	{:else if node.question}
		<SurveyQuestion {node} bind:context {next} />
	{:else if node.type === 'print'}
		<SurveyPrint {node} {context} />
	{:else if node.type === 'heading'}
		{#if node.depth === 1}
			<h1>
				{#each node.children as child}
					<svelte:self node={child} {context} {next} />
				{/each}
			</h1>
		{:else if node.depth === 2}
			<h2>
				{#each node.children as child}
					<svelte:self node={child} {context} {next} />
				{/each}
			</h2>
		{:else if node.depth > 2}
			<h3>
				{#each node.children as child}
					<svelte:self node={child} {context} {next} />
				{/each}
			</h3>
		{/if}
	{:else if node.type === 'paragraph'}
		<p>
			{#each node.children as child}
				<svelte:self node={child} {context} {next} />
			{/each}
		</p>
	{:else if node.type === 'list'}
		<ul>
			{#each node.children as child}
				<li>
					<svelte:self node={{ ...child.children[0], type: 'text' }} {context} {next} />
				</li>
			{/each}
		</ul>
	{:else if node.type === 'link'}
		{#if node.url === '+' || node.url === '-'}
			<!-- svelte-ignore a11y-invalid-attribute -->
			<a
				href="javascript:"
				class={node.url === '+' ? 'next' : 'back'}
				on:click={() => next(node.url)}
			>
				{#each node.children as child}
					<svelte:self node={child} {context} />
				{/each}
			</a>
		{:else}
			<a
				href={inlinePrints(node.url, context)}
				target={getUrlString(node.url).includes('//') ? '_blank' : '_self'}
				rel={getUrlString(node.url).includes('//') ? 'nofollow noopener' : ''}
			>
				{#each node.children as child}
					<svelte:self node={child} {context} />
				{/each}
			</a>
		{/if}
	{:else if node.type === 'image'}
		<img src={inlinePrints(node.url, context)} alt={node.alt} />
	{:else if node.type === 'strong'}
		<b>
			{#each node.children as child}
				<svelte:self node={child} {context} {next} />
			{/each}
		</b>
	{:else if node.type === 'emphasis'}
		<i>
			{#each node.children as child}
				<svelte:self node={child} {context} {next} />
			{/each}
		</i>
	{:else if node.type === 'inlineCode'}
		<tt>{node.value}</tt>
	{:else if node.type === 'break'}
		<br />
	{:else if node.value}
		{@html node.value}
	{:else if node.children}
		{#each node.children as child}
			<svelte:self node={child} {context} {next} />
		{/each}
	{/if}
{/if}
