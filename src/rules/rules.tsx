import { Rule } from "../rule";

import { givenNumbersRule } from "./givenNumbers";
import { blocksRule } from "./blocks";
import { oddEvenRule } from "./oddEven";
import { nonConsecutiveRule } from "./nonConsecutive";
import { xvRule } from "./xv";

export const allRules: Rule<any, any>[] = [
  givenNumbersRule,
  blocksRule,
  oddEvenRule,
  nonConsecutiveRule,
  xvRule,
];
