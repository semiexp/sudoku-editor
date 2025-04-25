import Module from "./solver/sudoku_variants_solver.js";

let Solver = null;

export function solve(problem) {
  if (Solver === null) {
    Solver = Module();
  }

  const puzzle = { size: problem.size };
  for (const rule of problem.enabledRules) {
    puzzle[rule] = problem.ruleData.get(rule);
  }

  const puzzleJson = JSON.stringify(puzzle);

  const puzzleJsonEncoded = new TextEncoder().encode(puzzleJson);

  const buf = Solver._malloc(puzzleJsonEncoded.length);
  Solver.HEAPU8.set(puzzleJsonEncoded, buf);

  let res = Solver._solve_problem(buf, puzzleJsonEncoded.length);
  const length =
    Solver.HEAPU8[res] |
    (Solver.HEAPU8[res + 1] << 8) |
    (Solver.HEAPU8[res + 2] << 16) |
    (Solver.HEAPU8[res + 3] << 24);

  const resStr = new TextDecoder().decode(
    Solver.HEAPU8.slice(res + 4, res + 4 + length),
  );
  return JSON.parse(resStr);
}
