<script>
// @ts-nocheck

	import SurveyNode from '$lib/SurveyNode.svelte';


/** @type {import('./$types').PageData} */
export let data;

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  function uid() {
    var id = '';
    var size = 16;
    while (size--) id += chars[(Math.random() * 62) | 0];
    return id;
  }

  function next() {}

  let context = {
      uid: uid(),
      started_at: new Date().toISOString().substring(0, 19).replace('T', ' ')
    };
</script>

<div class="viewport typo">
  {#each data.post.content as page, i}
    <div
      class="view">
      <div class="view-body">
        {#each page.children as node}
          <SurveyNode {node} bind:context {next} />
        {/each}
      </div>
    </div>
  {/each}
</div>
