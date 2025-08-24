import { Rule, PRIORITY_ODD_EVEN } from "../rule";
import { Item } from "../penpaExporter";

type OddEvenState = object;

type OddEvenData = {
  cellKind: number[][];
};

export const oddEvenRule: Rule<OddEvenState, OddEvenData> = {
  name: "oddEven",
  initialState: {},
  initialData: (size: number) => {
    const cellKind = new Array(size).fill(0).map(() => new Array(size).fill(0));
    return { cellKind };
  },
  eventTypes: ["cellMouseDown"],
  reducer: (_state, data, event) => {
    if (event.type === "cellMouseDown") {
      const y = event.y;
      const x = event.x;
      if (
        0 <= y &&
        y < data.cellKind.length &&
        0 <= x &&
        x < data.cellKind[y].length
      ) {
        const newCellKind = data.cellKind.map((row) => [...row]);
        newCellKind[y][x] = (newCellKind[y][x] + 1) % 3;
        return { data: { ...data, cellKind: newCellKind } };
      }
    }
    return {};
  },
  render: (_state, data, options) => {
    const { cellSize, margin } = options;
    const items = [];

    for (let y = 0; y < data.cellKind.length; ++y) {
      for (let x = 0; x < data.cellKind[y].length; ++x) {
        if (data.cellKind[y][x] === 1) {
          items.push(
            <circle
              key={`odd-${y}-${x}`}
              cx={margin + (x + 0.5) * cellSize}
              cy={margin + (y + 0.5) * cellSize}
              r={cellSize * 0.4}
              fill="rgb(128, 128, 128)"
              fillOpacity={0.5}
            />,
          );
        } else if (data.cellKind[y][x] === 2) {
          items.push(
            <rect
              key={`even-${y}-${x}`}
              x={margin + x * cellSize + cellSize * 0.1}
              y={margin + y * cellSize + cellSize * 0.1}
              width={cellSize * 0.8}
              height={cellSize * 0.8}
              fill="rgb(128, 128, 128)"
              fillOpacity={0.5}
            />,
          );
        }
      }
    }
    return [
      {
        priority: PRIORITY_ODD_EVEN,
        item: <g>{items}</g>,
      },
    ];
  },
  exportToPenpa: (data) => {
    const items: Item[] = [];
    for (let y = 0; y < data.cellKind.length; y++) {
      for (let x = 0; x < data.cellKind[y].length; x++) {
        const kind = data.cellKind[y][x];
        if (kind === 1) {
          items.push({
            kind: "symbol",
            position: { y, x },
            color: 3,
            symbolName: "circle_L",
            isFront: false,
          });
        } else if (kind === 2) {
          items.push({
            kind: "symbol",
            position: { y, x },
            color: 3,
            symbolName: "square_L",
            isFront: false,
          });
        }
      }
    }
    return { items, margin: 0 };
  },
};
