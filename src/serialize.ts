import lzstring from "lz-string";
import { allRules } from "./rules/rules";
import { Problem } from "./puzzle";

export const saveProblemAsString = (problem: Problem): string => {
  const ruleData: any = {};  // eslint-disable-line @typescript-eslint/no-explicit-any
  for (const [key, value] of problem.ruleData.entries()) {
    if (problem.enabledRules.includes(key)) {
      ruleData[key] = value;
    }
  }
  const json = JSON.stringify({
    size: problem.size,
    enabledRules: problem.enabledRules,
    ruleData,
  });
  return lzstring.compressToEncodedURIComponent(json);
};

export const loadProblemFromString = (str: string): Problem => {
  const json = lzstring.decompressFromEncodedURIComponent(str);
  if (json === null) {
    throw new Error("Invalid problem string");
  }
  const { size, enabledRules, ruleData } = JSON.parse(json);
  const ruleDataMap = new Map(Object.entries(ruleData));

  for (const rule of allRules) {
    if (!enabledRules.includes(rule.name)) {
      // TODO: block size
      ruleDataMap.set(rule.name, rule.initialData(size, 0));
    }
  }

  return {
    size,
    enabledRules,
    ruleData: ruleDataMap,
  };
};
