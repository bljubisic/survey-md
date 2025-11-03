import { md } from '$lib';

// Disable SSR for this test page to avoid hydration issues in Playwright tests
export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const text = `## Survey Test Page

?name Enter your name

?age min=0 max=120 How old are you?

?email email What is your email?

?color shuffle
- Red
- Green
- Blue
- Yellow

?hobbies min=1 max=3
- Reading
- Sports
- Music
- Gaming
- Cooking

?bio rows=3 Tell us about yourself

@ name
Your name is {name}.

@ age > 18
You are an adult!

@ color
You chose {color}.

---

## Page 2

?subscribe
- Yes, send me updates
- No, thanks

@ subscribe
[Submit](+)`;

	const survey = await md(text);
	return {
		post: {
			title: 'Test Survey',
			content: survey
		}
	};
}
