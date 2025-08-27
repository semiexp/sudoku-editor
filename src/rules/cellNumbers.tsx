import { ReactElement } from "react";
import { EditorEvent, EditorEventType } from "../events";
import { PRIORITY_SELECTED_CELL_MARKER, RenderOptions } from "../rule";

export type CellNumbersState = object;

export type CellNumbersData = {
  selectedCell: { y: number; x: number } | null;
  numbers: (number | null)[][];
};

export const cellNumbersRule = {
  initialState: {},
  initialData: (size: number) => {
    const numbers = [];
    for (let i = 0; i < size; i++) {
      numbers.push(new Array(size).fill(null));
    }
    return { selectedCell: null, numbers };
  },
  eventTypes: ["cellMouseDown", "keyDown"] as EditorEventType[],
  reducer: (
    state: CellNumbersState,
    data: CellNumbersData,
    event: EditorEvent,
  ) => {
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
        const newData = { ...data, selectedCell: { y, x } };
        return { data: newData };
      }
    } else if (event.type === "keyDown") {
      if (data.selectedCell === null) {
        return {};
      }
      const { selectedCell } = data;
      const { y, x } = selectedCell;

      const key = event.key;

      if (key === "ArrowUp" || key === "w") {
        if (y > 0) {
          const newData = { ...data, selectedCell: { y: y - 1, x } };
          return { data: newData };
        }
      } else if (key === "ArrowDown" || key === "s") {
        if (y < data.numbers.length - 1) {
          const newData = { ...data, selectedCell: { y: y + 1, x } };
          return { data: newData };
        }
      } else if (key === "ArrowLeft" || key === "a") {
        if (x > 0) {
          const newData = { ...data, selectedCell: { y, x: x - 1 } };
          return { data: newData };
        }
      } else if (key === "ArrowRight" || key === "d") {
        if (x < data.numbers[y].length - 1) {
          const newData = { ...data, selectedCell: { y, x: x + 1 } };
          return { data: newData };
        }
      } else if (key === "Backspace" || key === "Delete" || key === " ") {
        const newNumbers = data.numbers.map((row) => row.slice());
        newNumbers[y][x] = null;
        const newData = { ...data, numbers: newNumbers };
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
        const newData = { ...data, numbers: newNumbers };
        return { data: newData };
      }
    }
    return {};
  },
  render: (
    state: CellNumbersState | null,
    data: CellNumbersData,
    options: RenderOptions,
    textColor: string,
    numberPriority: number,
  ) => {
    let background: ReactElement | undefined = undefined;

    if (state !== null && data.selectedCell) {
      const { x, y } = data.selectedCell;
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
              fill={textColor}
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
        priority: numberPriority,
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
