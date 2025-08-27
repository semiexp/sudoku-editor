import { allRules } from "./rules/rules";

export type Problem = {
  size: number;
  enabledRules: string[];
  ruleData: Map<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type Answer = {
  decidedNumbers: (number | null)[][];
  candidates: boolean[][][];
} | null;

export const defaultProblem = (size: number, blockWidth: number): Problem => {
  const ruleData = new Map<string, any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
  for (const rule of allRules) {
    ruleData.set(rule.name, rule.initialData(size, blockWidth));
  }
  return {
    size: size,
    enabledRules: ["answer", "givenNumbers", "blocks"],
    ruleData: ruleData,
  };
};
