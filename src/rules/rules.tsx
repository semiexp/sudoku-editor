import { Rule } from "../rule";

import { givenNumbersRule } from "./givenNumbers";
import { blocksRule } from "./blocks";

export const allRules: Rule<any, any>[] = [
  givenNumbersRule,
  blocksRule,
];
