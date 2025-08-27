import { Rule, PRIORITY_ANSWER } from "../rule";
import {
  CellNumbersState,
  CellNumbersData,
  cellNumbersRule,
} from "./cellNumbers";

export const answerRule: Rule<CellNumbersState, CellNumbersData> = {
  name: "answer",
  initialState: cellNumbersRule.initialState,
  initialData: cellNumbersRule.initialData,
  eventTypes: cellNumbersRule.eventTypes,
  reducer: cellNumbersRule.reducer,
  render: (state, data, options) =>
    cellNumbersRule.render(
      state,
      data,
      options,
      "rgb(0, 128, 0)",
      PRIORITY_ANSWER,
    ),
  exportToPenpa: () => {
    return { items: [], margin: 0 };
  },
};
