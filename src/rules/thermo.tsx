import { ReactElement } from "react";
import { Rule, PRIORITY_THERMO } from "../rule";
import { reducerForLines } from "./linesUtil";

type Thermo = { y: number; x: number }[];

type ThermoState = {
  currentThermo: Thermo | null;
};

type ThermoData = {
  thermos: Thermo[];
};

export const thermoRule: Rule<ThermoState, ThermoData> = {
  name: "thermo",
  initialState: { currentThermo: null },
  initialData: () => ({
    thermos: [],
  }),
  eventTypes: ["cellMouseDown", "cellMouseMove", "mouseUp"],
  reducer: (state, data, event, info) => {
    return reducerForLines(
      state,
      data,
      "currentThermo",
      "thermos",
      event,
      info,
    );
  },
  render: (state, data, options) => {
    const { cellSize, margin } = options;

    const items: ReactElement[] = [];

    const addThermo = (arrow: Thermo, i: number, color: string) => {
      const start = arrow[0];
      const startX = margin + (start.x + 0.5) * cellSize;
      const startY = margin + (start.y + 0.5) * cellSize;

      // draw the start circle
      items.push(
        <circle
          key={`thermo-start-${i}`}
          cx={startX}
          cy={startY}
          r={cellSize * 0.38}
          stroke={color}
          fill={color}
          strokeWidth={3}
        />,
      );

      for (let j = 1; j < arrow.length; ++j) {
        let startY = margin + (arrow[j - 1].y + 0.5) * cellSize;
        let startX = margin + (arrow[j - 1].x + 0.5) * cellSize;
        const endY = margin + (arrow[j].y + 0.5) * cellSize;
        const endX = margin + (arrow[j].x + 0.5) * cellSize;

        items.push(
          <line
            key={`thermo-${i}-${j}`}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={color}
            strokeWidth={cellSize * 0.25}
            strokeLinecap="round"
          />,
        );
      }
    };

    for (let i = 0; i < data.thermos.length; ++i) {
      addThermo(data.thermos[i], i, "rgb(208, 208, 208)");
    }
    if (state && state.currentThermo) {
      addThermo(state.currentThermo, data.thermos.length, "rgb(255, 176, 176)");
    }

    return [
      {
        priority: PRIORITY_THERMO,
        item: <g>{items}</g>,
      },
    ];
  },
};
