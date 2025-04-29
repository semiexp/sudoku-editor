import { ReactElement } from "react";
import { Rule, PRIORITY_CONSECUTIVE } from "../rule";

type ConsecutiveState = {};

type ConsecutiveData = {
  horizontalBorder: boolean[][];
  verticalBorder: boolean[][];
  allShown: boolean;
};

export const consecutiveRule: Rule<ConsecutiveState, ConsecutiveData> = {
  name: "consecutive",
  initialState: {},
  initialData: (size: number) => {
    const horizontalBorder = [];
    const verticalBorder = [];

    for (let y = 0; y < size - 1; ++y) {
      horizontalBorder.push(new Array(size).fill(false));
    }
    for (let x = 0; x < size; ++x) {
      verticalBorder.push(new Array(size - 1).fill(false));
    }

    return {
      horizontalBorder,
      verticalBorder,
      allShown: true,
    };
  },
  booleanFlags: ["allShown"],
  eventTypes: ["edgeMouseDown"],
  reducer: (_state, data, event) => {
    if (event.type === "edgeMouseDown") {
      const y = event.y;
      const x = event.x;

      if (event.direction === "horizontal") {
        if (
          !(
            1 <= y &&
            y <= data.horizontalBorder.length &&
            0 <= x &&
            x < data.horizontalBorder[y - 1].length
          )
        ) {
          return {};
        }
        const newHorizontalBorder = data.horizontalBorder.map((row) => [
          ...row,
        ]);
        newHorizontalBorder[y - 1][x] = !data.horizontalBorder[y - 1][x];
        const newData = { ...data, horizontalBorder: newHorizontalBorder };
        return { data: newData };
      } else if (event.direction === "vertical") {
        if (
          !(
            0 <= y &&
            y < data.verticalBorder.length &&
            1 <= x &&
            x <= data.verticalBorder[y].length
          )
        ) {
          return {};
        }
        const newVerticalBorder = data.verticalBorder.map((row) => [...row]);
        newVerticalBorder[y][x - 1] = !data.verticalBorder[y][x - 1];
        const newData = { ...data, verticalBorder: newVerticalBorder };
        return { data: newData };
      }
    }
    return {};
  },
  render: (_state, data, options) => {
    const items: ReactElement[] = [];

    for (let y = 0; y < data.horizontalBorder.length; ++y) {
      for (let x = 0; x < data.horizontalBorder[y].length; ++x) {
        if (data.horizontalBorder[y][x]) {
          items.push(
            <rect
              key={`consecutive-${y}-${x}`}
              x={options.margin + (x + 0.2) * options.cellSize}
              y={options.margin + (y + 0.9) * options.cellSize}
              width={options.cellSize * 0.6}
              height={options.cellSize * 0.2}
              fill="rgb(192, 192, 192)"
              stroke="black"
              strokeWidth={1}
            />,
          );
        }
      }
    }
    for (let y = 0; y < data.verticalBorder.length; ++y) {
      for (let x = 0; x < data.verticalBorder[y].length; ++x) {
        if (data.verticalBorder[y][x]) {
          items.push(
            <rect
              key={`consecutive-${y}-${x}`}
              x={options.margin + (x + 0.9) * options.cellSize}
              y={options.margin + (y + 0.2) * options.cellSize}
              width={options.cellSize * 0.2}
              height={options.cellSize * 0.6}
              fill="rgb(192, 192, 192)"
              stroke="black"
              strokeWidth={1}
            />,
          );
        }
      }
    }
    return [
      {
        priority: PRIORITY_CONSECUTIVE,
        item: <g>{items}</g>,
      },
    ];
  },
};
