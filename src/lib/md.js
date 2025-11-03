import { unified } from 'unified';
import remarkParse from 'remark-parse';

const questionType = 'question';
const conditionType = 'condition';
const printType = 'print';

const attrsRx = /((\w+) *= *"([^"]*))|((\w+) *= *([^ ]+))|(\w+)/g;

/**
 * Parse attributes from a string
 * @param {string} str
 * @returns {{ [key: string]: string | boolean }}
 */
function parseAttrs(str) {
	/** @type {{ [key: string]: string | boolean }} */
	const attrs = {};
	let m;
	attrsRx.lastIndex = 0; // Reset regex state
	do {
		m = attrsRx.exec(str);
		if (m) {
			const key = m[2] || m[5] || m[7];
			attrs[key] = m[7] ? true : m[3] || m[6];
		}
	} while (m);
	return attrs;
}

/**
 * Merge consecutive HTML and text nodes
 * @param {any[]} nodes
 */
function mergeHTML(nodes) {
	if (!nodes) return nodes;
	const merged = [];
	let html = null;

	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		if (node.type === 'html' || node.type === 'text') {
			if (html) {
				html.value += node.value;
			} else {
				html = { ...node };
				merged.push(html);
			}
		} else {
			html = null;
			merged.push(node);
		}
	}
	return merged;
}

/**
 * Process text nodes to extract {variable} print expressions
 * @param {any} node
 */
function processPrintExpressions(node) {
	if (node.type === 'text' && node.value) {
		const parts = [];
		let lastIndex = 0;
		const printRegex = /\{([^}]+)\}/g;
		let match;

		while ((match = printRegex.exec(node.value)) !== null) {
			// Add text before the match
			if (match.index > lastIndex) {
				parts.push({
					type: 'text',
					value: node.value.substring(lastIndex, match.index)
				});
			}
			// Add the print node
			parts.push({
				type: printType,
				expr: match[1]
			});
			lastIndex = match.index + match[0].length;
		}

		// Add remaining text
		if (lastIndex < node.value.length) {
			parts.push({
				type: 'text',
				value: node.value.substring(lastIndex)
			});
		}

		return parts.length > 0 ? parts : [node];
	}
	return [node];
}

/**
 * Unified plugin to transform markdown AST for survey syntax
 */
function survey() {
	return (/** @type {any} */ tree) => {
		/** @type {any[]} */
		const newChildren = [];
		let pendingQuestion = null;
		let pendingCondition = null;

		// First pass: identify questions and conditions
		for (let i = 0; i < tree.children.length; i++) {
			const node = tree.children[i];

			// Check for question syntax: ?questionName params placeholder
			if (node.type === 'paragraph' && node.children && node.children[0]) {
				const firstChild = node.children[0];
				if (firstChild.type === 'text' && firstChild.value) {
					const questionMatch = /^\? *(\w+) *(.*)/.exec(firstChild.value);
					if (questionMatch) {
						const remainingText = questionMatch[2].trim();

						// Extract parameters and placeholder text
						// Parameters are: key=value pairs or known flags (shuffle, email, etc.)
						// Strategy: match key=value patterns and known single-word params at the start
						let paramString = '';
						let placeholderText = remainingText;

						// First, extract key=value pairs
						const keyValuePattern = /(\w+)=("[^"]*"|'[^']*'|[^\s]+)/g;
						const keyValueMatches = [];
						let match;
						while ((match = keyValuePattern.exec(remainingText)) !== null) {
							keyValueMatches.push({ match: match[0], index: match.index });
						}

						// Also check for known single-word parameters at the beginning
						const knownParams = ['shuffle', 'email'];
						const firstWord = remainingText.split(/\s+/)[0];
						let paramEndIndex = 0;

						if (knownParams.includes(firstWord)) {
							paramString = firstWord;
							paramEndIndex = firstWord.length;
						}

						// Add key=value params that appear before regular text
						keyValueMatches.forEach((kv) => {
							if (kv.index <= paramEndIndex + 10) {
								// Close to start
								paramString += (paramString ? ' ' : '') + kv.match;
								paramEndIndex = Math.max(paramEndIndex, kv.index + kv.match.length);
							}
						});

						// Extract placeholder (text after parameters)
						if (paramEndIndex > 0) {
							placeholderText = remainingText.substring(paramEndIndex).trim();
						}

						const params = parseAttrs(paramString);

						pendingQuestion = {
							type: questionType,
							name: questionMatch[1],
							params: params
						};

						// If there's placeholder text, create a paragraph node
						if (placeholderText) {
							const placeholderNode = {
								...node,
								children: [{ type: 'text', value: placeholderText }]
							};
							placeholderNode[questionType] = pendingQuestion;
							pendingQuestion = null;
							newChildren.push(placeholderNode);
							continue;
						}

						continue; // Don't add this node to newChildren
					}

					const conditionMatch = /^@ *(.*)/.exec(firstChild.value);
					if (conditionMatch) {
						pendingCondition = {
							type: conditionType,
							expr: conditionMatch[1]
						};
						continue; // Don't add this node to newChildren
					}
				}
			}

			// Process the node
			const processedNode = { ...node };

			// Attach pending question or condition
			if (pendingQuestion) {
				processedNode[questionType] = pendingQuestion;
				pendingQuestion = null;
			}
			if (pendingCondition) {
				processedNode[conditionType] = pendingCondition;
				pendingCondition = null;
			}

			// Process children for print expressions
			if (processedNode.children) {
				const newNodeChildren = [];
				for (const child of processedNode.children) {
					const processed = processPrintExpressions(child);
					newNodeChildren.push(...processed);
				}
				processedNode.children = mergeHTML(newNodeChildren);
			}

			newChildren.push(processedNode);
		}

		tree.children = newChildren;
	};
}

/**
 * Transform the tree into pages
 * @param {any} tree
 */
function transformToPages(tree) {
	const pagebreakType = 'thematicBreak';
	const { children } = tree;
	/** @type {any[]} */
	const pages = [];
	/** @type {{ type: string; children: any[] }} */
	let page = { type: 'page', children: [] };

	for (let i = 0; i < children.length; i++) {
		const node = children[i];

		if (node.type === pagebreakType) {
			pages.push(page);
			page = { ...node, type: 'page', children: [] };
		} else {
			page.children.push(node);
		}
	}

	pages.push(page);
	return pages;
}

const processor = unified().use(remarkParse).use(survey);

/**
 * Parse markdown with survey extensions
 * @param {string} md - Markdown text to parse
 */
export default async function (md) {
	const tree = processor.parse(md);
	const transformed = await processor.run(tree);
	return transformToPages(transformed);
}
