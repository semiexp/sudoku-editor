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
import { skyscrapersRule } from "./skyscrapers";
import { xSumsRule } from "./xSums";
import { extraRegionsRule } from "./extraRegions";
import { palindromeRule } from "./palindrome";
import { forbiddenCandidatesRule } from "./forbiddenCandidates";
import { antiKnightRule } from "./antiKnight";
import { noTouchRule } from "./noTouch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const allRules: Rule<any, any>[] = [
  givenNumbersRule,
  blocksRule,
  extraRegionsRule,
  forbiddenCandidatesRule,
  diagonalRule,
  oddEvenRule,
  consecutiveRule,
  nonConsecutiveRule,
  xvRule,
  arrowRule,
  thermoRule,
  killerRule,
  skyscrapersRule,
  xSumsRule,
  palindromeRule,
  antiKnightRule,
  noTouchRule,
];
