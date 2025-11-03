import { Parser } from 'expr-eval';

/**
 * Creates a safe function to evaluate expressions within the survey context.
 * Uses expr-eval library to prevent arbitrary code execution.
 * @param {any} expr - The expression string to evaluate
 * @returns {function} A function that takes a context object and returns the evaluated result
 */
export function createFunction(expr) {
	const parser = new Parser();

	try {
		const parsedExpr = parser.parse(expr);

		return function (/** @type {any} */ context) {
			// Evaluate the expression with the context as variables
			return parsedExpr.evaluate(context);
		};
	} catch (error) {
		// Return a function that always returns undefined for invalid expressions
		const err = /** @type {Error} */ (error);
		console.error(`Failed to parse expression "${expr}":`, err.message);
		return function () {
			return undefined;
		};
	}
}
