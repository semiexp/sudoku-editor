import { Rule } from "../rule";

import { givenNumbersRule } from "./givenNumbers";
import { blocksRule } from "./blocks";
import { oddEvenRule } from "./oddEven";

export const allRules: Rule<any, any>[] = [
  givenNumbersRule,
  blocksRule,
  oddEvenRule,
];
