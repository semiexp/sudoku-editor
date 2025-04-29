import {
  Rule,
  PRIORITY_SELECTED_CELL_MARKER,
  PRIORITY_SKYSCRAPERS_NUMBERS,
} from "../rule";

import { SelectedOutsiceCell, reducerForOutsideCell } from "./outsideUtil";

type SkyscrapersState = {
  selectedOutsideCell: SelectedOutsiceCell | null;
};

type SkyscrapersData = {
  up: (number | null)[];
  down: (number | null)[];
  left: (number | null)[];
  right: (number | null)[];
};

export const skyscrapersRule: Rule<SkyscrapersState, SkyscrapersData> = {
  name: "skyscrapers",
  initialState: { selectedOutsideCell: null },
  initialData: (size: number) => ({
    up: new Array(size).fill(null),
    down: new Array(size).fill(null),
    left: new Array(size).fill(null),
    right: new Array(size).fill(null),
  }),
  eventTypes: ["cellMouseDown", "keyDown"],
  reducer: (state, data, event, info) => {
    if (event.type === "keyDown" && state.selectedOutsideCell !== null) {
      if (event.key.match(/^[0-9]$/) || event.key === "Backspace") {
        const newData = { ...data };
        const side = state.selectedOutsideCell.side;
        const pos = state.selectedOutsideCell.pos;
        newData[side] = [...newData[side]];

        if (event.key === "Backspace") {
          newData[side][pos] = null;
        } else {
          const v = parseInt(event.key, 10);
          let n = (newData[side][pos] ?? 0) * 10 + v;
          if (n > info.boardSize) {
            n = v;
          }
          newData[side][pos] = n;
        }
        return { data: newData };
      }
    }
    return reducerForOutsideCell(state, event, info);
  },
  render: (state, data, options) => {
    const items = [];

    if (state !== null && state?.selectedOutsideCell !== null) {
      const { cellSize, margin } = options;
      const side = state.selectedOutsideCell.side;
      const pos = state.selectedOutsideCell.pos;

      const x =
        side === "left" ? -1 : side === "right" ? data.left.length : pos;
      const y = side === "up" ? -1 : side === "down" ? data.up.length : pos;

      items.push({
        priority: PRIORITY_SELECTED_CELL_MARKER,
        item: (
          <rect
            key={`skyscraper-${side}-${pos}`}
            x={margin + x * cellSize}
            y={margin + y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="rgba(255, 216, 216)"
          />
        ),
      });
    }

    const clues = [];
    for (let i = 0; i < data.up.length; ++i) {
      if (data.up[i] !== null) {
        clues.push({
          y: -1,
          x: i,
          value: data.up[i],
        });
      }
    }
    for (let i = 0; i < data.down.length; ++i) {
      if (data.down[i] !== null) {
        clues.push({
          y: data.down.length,
          x: i,
          value: data.down[i],
        });
      }
    }
    for (let i = 0; i < data.left.length; ++i) {
      if (data.left[i] !== null) {
        clues.push({
          y: i,
          x: -1,
          value: data.left[i],
        });
      }
    }
    for (let i = 0; i < data.right.length; ++i) {
      if (data.right[i] !== null) {
        clues.push({
          y: i,
          x: data.right.length,
          value: data.right[i],
        });
      }
    }

    items.push({
      priority: PRIORITY_SKYSCRAPERS_NUMBERS,
      item: (
        <g>
          {clues.map((clue, i) => {
            const { x, y, value } = clue;
            const textX = options.margin + (x + 0.5) * options.cellSize;
            const textY = options.margin + (y + 0.5) * options.cellSize;
            return (
              <text
                key={`skyscraper-clue-${i}`}
                x={textX}
                y={textY}
                fontSize={options.cellSize * 0.7}
                fill="black"
                textAnchor="middle"
                dominantBaseline="central"
                style={{ userSelect: "none" }}
              >
                {value}
              </text>
            );
          })}
        </g>
      ),
    });

    return items;
  },
};
