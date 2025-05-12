import { ReactElement } from "react";
import {
  Rule,
  PRIORITY_CLUE_NUMBERS,
  PRIORITY_SELECTED_CELL_MARKER,
} from "../rule";

type GivenNumbersState = {
  selectedCell: { y: number; x: number } | null;
};

type GivenNumbersData = {
  numbers: (number | null)[][];
};

export const givenNumbersRule: Rule<GivenNumbersState, GivenNumbersData> = {
  name: "givenNumbers",
  initialState: { selectedCell: null },
  initialData: (size: number) => {
    const numbers = [];
    for (let i = 0; i < size; i++) {
      numbers.push(new Array(size).fill(null));
    }
    return { numbers };
  },
  eventTypes: ["cellMouseDown", "keyDown"],
  reducer: (state, data, event) => {
    if (state === undefined) {
      return {};
    }

    if (event.type === "cellMouseDown") {
      const y = event.y;
      const x = event.x;
      if (
        0 <= y &&
        y < data.numbers.length &&
        0 <= x &&
        x < data.numbers[y].length
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

      if (key === "ArrowUp" || key === "w") {
        if (y > 0) {
          const newState = { ...state, selectedCell: { y: y - 1, x } };
          return { state: newState };
        }
      } else if (key === "ArrowDown" || key === "s") {
        if (y < data.numbers.length - 1) {
          const newState = { ...state, selectedCell: { y: y + 1, x } };
          return { state: newState };
        }
      } else if (key === "ArrowLeft" || key === "a") {
        if (x > 0) {
          const newState = { ...state, selectedCell: { y, x: x - 1 } };
          return { state: newState };
        }
      } else if (key === "ArrowRight" || key === "d") {
        if (x < data.numbers[y].length - 1) {
          const newState = { ...state, selectedCell: { y, x: x + 1 } };
          return { state: newState };
        }
      } else if (key === "Backspace" || key === "Delete" || key === " ") {
        const newNumbers = data.numbers.map((row) => row.slice());
        newNumbers[y][x] = null;
        const newData = { numbers: newNumbers };
        return { data: newData };
      }
      // if key is a number
      const number = parseInt(key);
      if (!isNaN(number) && number >= 0 && number <= 9) {
        const newNumbers = data.numbers.map((row) => row.slice());

        let n = (newNumbers[y][x] ?? 0) * 10 + number;
        if (n > newNumbers.length) {
          n = number;
        }
        if (n === 0) {
          newNumbers[y][x] = null;
        } else {
          newNumbers[y][x] = n;
        }
        const newData = { numbers: newNumbers };
        return { data: newData };
      }
    }
    return {};
  },
  render: (state, data, options) => {
    let background: ReactElement | undefined = undefined;

    if (state && state.selectedCell) {
      const { x, y } = state.selectedCell;
      const cellSize = options.cellSize;
      const margin = options.margin;
      const rectX = x * cellSize + margin;
      const rectY = y * cellSize + margin;

      background = (
        <rect
          x={rectX}
          y={rectY}
          width={cellSize}
          height={cellSize}
          fill="rgb(255, 216, 216)"
        />
      );
    }

    const foregroundItems = [];
    for (let y = 0; y < data.numbers.length; y++) {
      for (let x = 0; x < data.numbers[y].length; x++) {
        const number = data.numbers[y][x];
        if (number !== null) {
          const cellSize = options.cellSize;
          const margin = options.margin;
          const rectX = x * cellSize + margin;
          const rectY = y * cellSize + margin;

          foregroundItems.push(
            <text
              key={`${y}-${x}`}
              x={rectX + cellSize / 2}
              y={rectY + cellSize / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={cellSize * 0.7}
              style={{ userSelect: "none" }}
            >
              {number}
            </text>,
          );
        }
      }
    }

    const items = [
      {
        priority: PRIORITY_CLUE_NUMBERS,
        item: <g>{foregroundItems}</g>,
      },
    ];
    if (background) {
      items.push({
        priority: PRIORITY_SELECTED_CELL_MARKER,
        item: <g>{background}</g>,
      });
    }
    return items;
  },
};
