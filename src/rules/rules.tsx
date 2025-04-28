import { Rule } from "../rule";

import { givenNumbersRule } from "./givenNumbers";
import { blocksRule } from "./blocks";
import { oddEvenRule } from "./oddEven";
import { nonConsecutiveRule } from "./nonConsecutive";
import { xvRule } from "./xv";
import { diagonalRule } from "./diagonal";
import { arrowRule } from "./arrow";
import { thermoRule } from "./thermo";
import { killerRule } from "./killer";
import { consecutiveRule } from "./consecutive";

export const allRules: Rule<any, any>[] = [
  givenNumbersRule,
  blocksRule,
  diagonalRule,
  oddEvenRule,
  consecutiveRule,
  nonConsecutiveRule,
  xvRule,
  arrowRule,
  thermoRule,
  killerRule,
];
