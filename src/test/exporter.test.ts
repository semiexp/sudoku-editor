import { describe, it, expect } from "vitest";

import { exportProblemToPenpa } from "../penpaExporter";

// NOTE: expected URLs should be human-verified

describe("penpa-edit exporter", () => {
  it("should correctly export empty 4x4 problem", () => {
    const problem = {
      size: 4,
      enabledRules: ["answer", "givenNumbers"],
      ruleData: new Map([
        [
          "answer",
          {
            numbers: Array(4)
              .fill(null)
              .map(() => Array(4).fill(null)),
          },
        ],
        [
          "givenNumbers",
          {
            numbers: Array(4)
              .fill(null)
              .map(() => Array(4).fill(null)),
          },
        ],
      ]),
    };
    expect(exportProblemToPenpa(problem)).toStrictEqual({
      hasConflicts: false,
      status: "ok",
      url: "https://opt-pan.github.io/penpa-edit/#m=solve&p=zVRLT+MwEL7nV6x89iEPHq1vPLZ7YXkWoVUUVW4baERSg5MAclV+OzPjLMWJue1h5frr5LPr+ZyZr/VzK3XO92AkIx7yCMc4pDmO8BN2Y1o0ZS5+8KO2WSkNAecXkwm/l2WdB2m3KwtSFjHOYpgRy95Z3S7VY8veiY6zYGOuxcbMRJptubndhaNdeCM2gOeEEeEfwglhTDiFrdwkhKeEIeE+4Rnt+Ul4R3hCuEd4QHsOMVkQpNHI3pnv+7/hRqCa1aqc1a2+l4ucCbozJ27dVvNcO1Sp1FNZrN19xcNa6dy7hGS+fPDtnyu97J3+KsvSIWqqoEMtCr0oXarRhfMstVavDlPJZuUQc9lAxetV8eSelK8bV0AjXYnyUfayVbs7bwP2xmimMY8PeBxhU4yFueLml3C6h5sr6IrfwlxiU6SMQTWwuF0vYYU/wztax+jEklGYYRPZOMMeSpl9L7Mzy1yK1CScYZ5j+jWGrFIvINXqwOeFquYFEl9eh13pWvtvCuisIyv3xiM32clNPuUmfrnxt3Kn/0ruONvaQoT/myPfOrMp7fUb0B7LAeu1VscP3AX8wEeYcGglYD1uArZvKKCGngJyYCvgvnEWnto3F6rq+wtTDSyGqb66DP61KPoA",
    });
  });
});
