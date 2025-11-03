# What is Survey-md

Survey-md is an attempt to simplify creating and using surveys through the code. As a starting point, I used [surv.app project](https://surv.app) which provided the same functionality but on server side. I am trying to offer something like this out of necessity to use similar library for dynamically survey generation using markdown coming from BE. md stands for Markdown as I am using markdown language to describe the surveys. All results are stored in context object and you can easily access them using context["question_name"]. There are couple of rules how to do that:

- Pages are delimited by using standard Markdown delimiter, either `***` or `---`
- Questions are marked with question mark as the first character on the line, following with the question variable `?question_name`
- Closed questions are always followed with the list of available items, which is described using normal Markdown syntax
- Opened questions are followed with placeholder text
- If you would like to display answer on the survey, you can do that by enclosing the question_name within curly brackets, `{question_name}`
- Also, in addition to this, you can add dynamic question selection by using regular Javascript expressions enclosed in curly brackets
- You can also specify max number of answers question can provide with using `max=num` and `min=num` after the question_name
- You can specify conditions for displaying elements of the surveys, like submit buttons or even displaying whole pages. Condition is specified using `@` as the first character on the line. It should be followed by conditional javascript expression.
- Lists of the available answers can be shuffled by using `shuffle` after the question_name in the question description
- Numbers can be entered by using selection box, using `min=num max=num` right after the question_name. The question type should be opened question.
- Style can also be overwritten by using `<style>` html tag within your markdown snippet.

# Using Survey-md

Using survey-md is simple, you should just add the survey-md in your package.json. After that all of the necessary tools would be available to you. Most simple way of usage is creating your `+page.svelte` together with `+page.js` file. `+page.js` would be used for parsing the markdown and providing the resulting data to the `+page.svelte` where it can be used. Sample `+page.js` should be something like this:

```
/** @type {import('./$types').PageLoad} */
import md from 'survey-md/md'
export async function load({params}) {
  const text = "## Hi! Please pick a number.\n  (We shuffle them *every time*)\n\n?mynumber shuffle\n- 1337\n- [42](https://www.google.com/search?q=42)\n- 7±2\n\n@ mynumber\n[Submit](+)";
  const survey = await md(text);
	return {
		post: {
			title: `Title goes here`,
			content: survey,
		}
	};
}
```

Comment above the function must be there to provide the data to the `+page.svelte`, which should use it like this:

```
    /** @type {import('./$types').PageData} */
    export let data;
```

added somewhere within your `<script>` tag. Normally you would use something like this to display the survey to the users:

```
<div class="viewport typo">
  {#each data.post.content as page, i}
    {#if i === pageIndex}
      <div
        class="view">
        <div class="view-body">
          {#each page.children as node}
            <SurveyNode {node} bind:context {next} />
          {/each}
        </div>
      </div>
    {/if}
  {/each}
</div>
```

That should be enough to get you started!
