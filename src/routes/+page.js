import { md } from '$lib';

/** @type {import('./$types').PageLoad} */
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