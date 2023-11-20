/**
 * @param {any} expr
 */
export function createFunction(expr) {
  return new Function("survey", `with(survey) return ${expr}`);
}
