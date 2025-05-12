import {
  Rule,
  PRIORITY_FORBIDDEN_CANDIDATES,
  PRIORITY_SELECTED_CELL_MARKER,
} from "../rule";

type ForbiddenCandidatesState = {
  selectedCell: { y: number; x: number } | null;
};

type ForbiddenCandidatesData = {
  isForbidden: boolean[][][];
};

export const forbiddenCandidatesRule: Rule<
  ForbiddenCandidatesState,
  ForbiddenCandidatesData
> = {
  name: "forbiddenCandidates",
  initialState: { selectedCell: null },
  initialData: (size: number) => {
    const isForbidden = [];
    for (let i = 0; i < size; ++i) {
      const row = [];
      for (let j = 0; j < size; ++j) {
        row.push(new Array(size).fill(false));
      }
      isForbidden.push(row);
    }
    return { isForbidden };
  },
  eventTypes: ["cellMouseDown", "keyDown"],
  reducer: (state, data, event) => {
    if (event.type === "cellMouseDown") {
      const y = event.y;
      const x = event.x;
      if (
        0 <= y &&
        y < data.isForbidden.length &&
        0 <= x &&
        x < data.isForbidden[y].length
      ) {
        const newState = { ...state, selectedCell: { y, x } };
        return { state: newState };
      }
    } else if (event.type === "keyDown") {
      if (state.selectedCell === null) {
        return {};
      }
      const { selectedCell } = state;
      const { y, x } = selectedCell;

      const key = event.key;

      if (key === "ArrowUp") {
        if (y > 0) {
          const newState = { ...state, selectedCell: { y: y - 1, x } };
          return { state: newState };
        }
      } else if (key === "ArrowDown") {
        if (y < data.isForbidden.length - 1) {
          const newState = { ...state, selectedCell: { y: y + 1, x } };
          return { state: newState };
        }
      } else if (key === "ArrowLeft") {
        if (x > 0) {
          const newState = { ...state, selectedCell: { y, x: x - 1 } };
          return { state: newState };
        }
      } else if (key === "ArrowRight") {
        if (x < data.isForbidden[y].length - 1) {
          const newState = { ...state, selectedCell: { y, x: x + 1 } };
          return { state: newState };
        }
      } else {
        const n = parseInt(key, 36);
        if (1 <= n && n <= data.isForbidden.length) {
          const newIsForbidden = data.isForbidden.map((row) =>
            row.map((cell) => cell.slice()),
          );
          newIsForbidden[y][x][n - 1] = !newIsForbidden[y][x][n - 1];
          const newData = { isForbidden: newIsForbidden };
          return { data: newData };
        }
      }
    }

    return {};
  },
  render: (state, data, options) => {
    const { cellSize, margin } = options;

    const items = [];

    if (state !== null && state.selectedCell !== null) {
      const { selectedCell } = state;
      const { y, x } = selectedCell;

      items.push({
        priority: PRIORITY_SELECTED_CELL_MARKER,
        item: (
          <rect
            x={margin + x * cellSize}
            y={margin + y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="rgb(255, 216, 216)"
          />
        ),
      });
    }

    const forbiddenMarkers = [];
    const w = Math.ceil(Math.sqrt(data.isForbidden.length));

    for (let y = 0; y < data.isForbidden.length; ++y) {
      for (let x = 0; x < data.isForbidden[y].length; ++x) {
        for (let n = 0; n < data.isForbidden[y][x].length; ++n) {
          if (data.isForbidden[y][x][n]) {
            const textY =
              margin +
              y * cellSize +
              ((Math.floor(n / w) + 0.5) / w) * cellSize;
            const textX =
              margin + x * cellSize + (((n % w) + 0.5) / w) * cellSize;
            forbiddenMarkers.push(
              <text
                key={`forbidden-${y}-${x}-${n}`}
                x={textX}
                y={textY}
                fontSize={(cellSize / w) * 0.9}
                fill="black"
                textAnchor="middle"
                dominantBaseline="central"
                style={{ userSelect: "none" }}
              >
                {n + 1}
              </text>,
            );

            const crossSize = (cellSize / w) * 0.3;
            forbiddenMarkers.push(
              <line
                key={`forbidden-cross-${y}-${x}-${n}-1`}
                x1={textX - crossSize}
                y1={textY - crossSize}
                x2={textX + crossSize}
                y2={textY + crossSize}
                stroke="red"
                strokeWidth={1}
              />,
            );
            forbiddenMarkers.push(
              <line
                key={`forbidden-cross-${y}-${x}-${n}-2`}
                x1={textX + crossSize}
                y1={textY - crossSize}
                x2={textX - crossSize}
                y2={textY + crossSize}
                stroke="red"
                strokeWidth={1}
              />,
            );
          }
        }
      }
    }

    items.push({
      priority: PRIORITY_FORBIDDEN_CANDIDATES,
      item: <g>{forbiddenMarkers}</g>,
    });

    return items;
  },
};
