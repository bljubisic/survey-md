<script context="module">
  // @ts-nocheck
    /**
     * @param {{ children: any; value: any; }} node
     */
    function flatten(node) {
      return (node.children || [])
        .reduce((/** @type {string} */ text, /** @type {{ children: any; value: any; }} */ node) => text + " " + flatten(node), node.value || "")
        .trim();
    }
  
    /**
     * @param {string | any[]} array
     */
    function shuffleArray(array) {
      for (let i = array.length - 1, j; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        // @ts-ignore
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
  </script>
  
  <script>
    import SurveyNode from "./SurveyNode.svelte";
  
    /**
     * @type {{ [x: string]: any; }}
     */
     export let context;
    /**
     * @type {{ question?: any; type?: any; children: any; value?: any; }}
     */
     export let node;
    export let next = () => {};
  
    const { params } = node.question;
    if (node.type === "list" && params && params.shuffle) {
      shuffleArray(node.children);
    }
    const multi = node.type === "list" && params && (params.min || params.max);
    const textValues = node.children.map(flatten);
  
    let checked = {};
    const selected = context[node.question.name];
  
    if (selected === undefined) {
      context[node.question.name] = null;
    }
  
    if (Array.isArray(selected)) {
      textValues.forEach((/** @type {any} */ v, /** @type {string | number} */ i) => {
        // @ts-ignore
        checked[i] = selected.includes(v);
      });
    }
  
    const className = params.class || "";
  
    /**
     * @param {number} i
     */
    function check(i) {
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
      } else {
        checked = { [i]: true };
      }
      // @ts-ignore
      const val = textValues.filter((/** @type {any} */ _v, /** @type {string | number} */ i) => !!checked[i]);
      if (multi) {
        const min = params.min || 0;
        save(val.length >= min ? val : []);
      } else {
        save(val[0]);
      }
    }
  
    /**
     * @param {any} val
     */
    function save(val) {
      context[node.question.name] = val;
    }
  
    const qname = node.question.name;
  </script>
  
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
      content: "";
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
      content: " ";
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
      content: "✓";
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
    .input input[type="number"] {
      display: inline-block;
      width: auto;
    }
  </style>
  
  {#if node.type === 'list'}
    <ul
      id={qname}
      class:multi={multi && !className}
      class:single={!multi && !className}
      class={className}>
      {#each node.children as child, i}
        <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
        <li
          on:click={() => check(i)}
          class:checked={checked[i]}
          role="checkbox"
          aria-checked={checked[i]}>
          <SurveyNode
            node={{ ...child.children[0], type: 'text' }}
            {context}
            {next} />
        </li>
      {/each}
    </ul>
  {:else if node.type === 'paragraph'}
    <p id={qname} class="input {className}">
      {#if params.rows}
        <textarea
          rows={params.rows}
          placeholder={flatten(node)}
          bind:value={context[node.question.name]} />
      {:else if !isNaN(params.min) || !isNaN(params.max)}
        <input
          type="number"
          min={params.min}
          max={params.max}
          placeholder={flatten(node)}
          bind:value={context[node.question.name]} />
      {:else if params.email}
        <input
          type="email"
          placeholder={flatten(node)}
          bind:value={context[node.question.name]} />
      {:else}
        <input
          type="text"
          placeholder={flatten(node)}
          bind:value={context[node.question.name]} />
      {/if}
    </p>
  {/if}
  