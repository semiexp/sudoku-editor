import { Rule, PRIORITY_CLUE_NUMBERS } from "../rule";
import { Item } from "../penpaExporter";
import {
  CellNumbersState,
  CellNumbersData,
  cellNumbersRule,
} from "./cellNumbers";

export const givenNumbersRule: Rule<CellNumbersState, CellNumbersData> = {
  name: "givenNumbers",
  initialState: cellNumbersRule.initialState,
  initialData: cellNumbersRule.initialData,
  eventTypes: cellNumbersRule.eventTypes,
  reducer: cellNumbersRule.reducer,
  render: (state, data, options) =>
    cellNumbersRule.render(
      state,
      data,
      options,
      "black",
      PRIORITY_CLUE_NUMBERS,
    ),
  exportToPenpa: (data) => {
    const items: Item[] = [];
    for (let y = 0; y < data.numbers.length; y++) {
      for (let x = 0; x < data.numbers[y].length; x++) {
        const number = data.numbers[y][x];
        if (number !== null) {
          items.push({
            kind: "text",
            position: { y, x },
            value: number.toString(),
            color: 1,
            style: "1",
          });
        }
      }
    }
    return { items, margin: 0 };
  },
};
