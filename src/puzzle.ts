export type Problem = {
  size: number;
  enabledRules: string[];
  ruleData: Map<string, any>;  // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type Answer = {
  decidedNumbers: (number | null)[][];
  candidates: boolean[][][];
} | null;
