import { describe, it, expect } from 'vitest';
import md from './lib/md.js';
import { createFunction } from './lib/expressions.js';

describe('md parser', () => {
	it('should parse basic markdown with questions', async () => {
		const text = '?myquestion\n- Option 1\n- Option 2';
		const result = await md(text);
		expect(result).toBeDefined();
		expect(result.length).toBeGreaterThan(0);
		expect(result[0].type).toBe('page');
	});

	it('should parse heading', async () => {
		const text = '## Hello World';
		const result = await md(text);
		expect(result[0].children).toBeDefined();
		const heading = result[0].children[0];
		expect(heading).toBeDefined();
		expect(heading.type).toBe('heading');
		expect(heading.depth).toBe(2);
	});

	it('should parse question with parameters', async () => {
		const text = '?myquestion shuffle\n- A\n- B\n- C';
		const result = await md(text);
		const question = result[0].children.find((node: any) => node.question);
		expect(question).toBeDefined();
		if (question) {
			expect(question.question.name).toBe('myquestion');
			expect(question.question.params.shuffle).toBe(true);
		}
	});

	it('should parse print expressions in text', async () => {
		const text = 'Hello {name}, you are {age} years old';
		const result = await md(text);
		const paragraph = result[0].children[0];
		expect(paragraph).toBeDefined();
		if (paragraph) {
			expect(paragraph.type).toBe('paragraph');
			expect(paragraph.children).toBeDefined();
			// Should have: text, print, text, print, text
			expect(paragraph.children.length).toBeGreaterThan(2);
			const printNodes = paragraph.children.filter((n: any) => n.type === 'print');
			expect(printNodes.length).toBe(2);
			expect(printNodes[0].expr).toBe('name');
			expect(printNodes[1].expr).toBe('age');
		}
	});

	it('should parse conditional expressions', async () => {
		const text = '@ x > 5\n\nShow this content';
		const result = await md(text);
		expect(result[0].children).toBeDefined();
		expect(result[0].children.length).toBeGreaterThan(0);
		const nodeWithCondition = result[0].children.find((n: any) => n.condition);
		expect(nodeWithCondition).toBeDefined();
		if (nodeWithCondition) {
			expect(nodeWithCondition.condition.expr).toBe('x > 5');
		}
	});

	it('should split content into pages on thematic breaks', async () => {
		const text = 'Page 1\n\n---\n\nPage 2';
		const result = await md(text);
		expect(result.length).toBe(2);
		expect(result[0].type).toBe('page');
		expect(result[1].type).toBe('page');
	});
});

describe('expression evaluator', () => {
	it('should safely evaluate simple expressions', () => {
		const fn = createFunction('x + 1');
		const result = fn({ x: 5 });
		expect(result).toBe(6);
	});

	it('should handle context variables', () => {
		const fn = createFunction('name');
		const result = fn({ name: 'Test' });
		expect(result).toBe('Test');
	});

	it('should handle invalid expressions gracefully', () => {
		const fn = createFunction('invalid syntax {}}');
		const result = fn({ foo: 'bar' });
		expect(result).toBeUndefined();
	});

	it('should handle boolean expressions', () => {
		const fn = createFunction('x > 5');
		expect(fn({ x: 10 })).toBe(true);
		expect(fn({ x: 3 })).toBe(false);
	});
});
