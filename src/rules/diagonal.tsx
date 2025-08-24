import { Rule, PRIORITY_DIAGNOAL } from "../rule";
import { Item } from "../penpaExporter";

type DiagonalState = object;
type DiagonalData = {
  mainDiagonal: boolean;
  antiDiagonal: boolean;
};

export const diagonalRule: Rule<DiagonalState, DiagonalData> = {
  name: "diagonal",
  initialState: {},
  initialData: () => ({
    mainDiagonal: true,
    antiDiagonal: true,
  }),
  booleanFlags: ["mainDiagonal", "antiDiagonal"],
  eventTypes: [],
  reducer: () => {
    return {};
  },
  render: (_state, data, options) => {
    const items = [];

    const { boardSize, cellSize, margin } = options;
    if (data.mainDiagonal) {
      for (let i = 0; i < boardSize; ++i) {
        items.push(
          <line
            key={`mainDiagonal-${i}`}
            x1={i * cellSize + margin}
            y1={i * cellSize + margin}
            x2={(i + 1) * cellSize + margin}
            y2={(i + 1) * cellSize + margin}
            stroke="black"
            strokeWidth={1}
            strokeDasharray={"5 5"}
          />,
        );
      }
    }
    if (data.antiDiagonal) {
      for (let i = 0; i < boardSize; ++i) {
        items.push(
          <line
            key={`antiDiagonal-${i}`}
            x1={(boardSize - i) * cellSize + margin}
            y1={i * cellSize + margin}
            x2={(boardSize - i - 1) * cellSize + margin}
            y2={(i + 1) * cellSize + margin}
            stroke="black"
            strokeWidth={1}
            strokeDasharray={"5 5"}
          />,
        );
      }
    }

    return [
      {
        priority: PRIORITY_DIAGNOAL,
        item: <g>{items}</g>,
      },
    ];
  },
  exportToPenpa: (data) => {
    const items: Item[] = [];
    if (data.mainDiagonal) {
      items.push({ kind: "diagonal", direction: "main" });
    }
    if (data.antiDiagonal) {
      items.push({ kind: "diagonal", direction: "anti" });
    }
    return { items, margin: 0 };
  },
};
