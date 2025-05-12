import { ReactElement } from "react";
import { Rule, PRIORITY_XV } from "../rule";

type XVState = object;

type XVData = {
  horizontalBorder: number[][];
  verticalBorder: number[][];
  allShown: boolean;
};

export const xvRule: Rule<XVState, XVData> = {
  name: "xv",
  initialState: {},
  initialData: (size: number) => {
    const horizontalBorder = [];
    const verticalBorder = [];

    for (let y = 0; y < size - 1; ++y) {
      horizontalBorder.push(new Array(size).fill(0));
    }
    for (let x = 0; x < size; ++x) {
      verticalBorder.push(new Array(size - 1).fill(0));
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
        newHorizontalBorder[y - 1][x] =
          (data.horizontalBorder[y - 1][x] + 1) % 3;
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
        newVerticalBorder[y][x - 1] = (data.verticalBorder[y][x - 1] + 1) % 3;
        const newData = { ...data, verticalBorder: newVerticalBorder };
        return { data: newData };
      }
    }
    return {};
  },
  render: (_state, data, options) => {
    const items: ReactElement[] = [];

    const addItem = (y: number, x: number, val: number) => {
      items.push(
        <rect
          key={`xv-${y}-${x}`}
          x={options.margin + (x - 0.2) * options.cellSize}
          y={options.margin + (y - 0.2) * options.cellSize}
          width={options.cellSize * 0.4}
          height={options.cellSize * 0.4}
          fill="white"
        />,
      );
      items.push(
        <text
          key={`xv-text-${y}-${x}`}
          x={options.margin + x * options.cellSize}
          y={options.margin + y * options.cellSize}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={options.cellSize * 0.3}
          style={{ userSelect: "none" }}
        >
          {val === 1 ? "X" : "V"}
        </text>,
      );
    };

    for (let y = 0; y < data.horizontalBorder.length; ++y) {
      for (let x = 0; x < data.horizontalBorder[y].length; ++x) {
        if (data.horizontalBorder[y][x] !== 0) {
          addItem(y + 1, x + 0.5, data.horizontalBorder[y][x]);
        }
      }
    }
    for (let y = 0; y < data.verticalBorder.length; ++y) {
      for (let x = 0; x < data.verticalBorder[y].length; ++x) {
        if (data.verticalBorder[y][x] !== 0) {
          addItem(y + 0.5, x + 1, data.verticalBorder[y][x]);
        }
      }
    }
    return [
      {
        priority: PRIORITY_XV,
        item: <g>{items}</g>,
      },
    ];
  },
};
