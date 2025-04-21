import { Rule } from "../rule";

import { givenNumbersRule } from "./givenNumbers";
import { blocksRule } from "./blocks";
import { oddEvenRule } from "./oddEven";
import { nonConsecutiveRule } from "./nonConsecutive";

export const allRules: Rule<any, any>[] = [
  givenNumbersRule,
  blocksRule,
  oddEvenRule,
  nonConsecutiveRule,
];
