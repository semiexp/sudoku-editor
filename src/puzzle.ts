export type Problem = {
  size: number;
  enabledRules: string[];
  ruleData: Map<string, any>;
};

export type Answer = {
  decidedNumbers: (number | null)[][];
  candidates: boolean[][][];
} | null;
