import { ReactElement } from "react";
import {
  Rule,
  PRIORITY_EXTRA_REGION,
  PRIORITY_EXTRA_REGION_BORDER,
} from "../rule";
import { reducerForRegions } from "./regionsUtil";

type Region = { cells: { y: number; x: number }[] };

type ExtraRegionsState = {
  currentRegion: Region | null;
  selectedRegionId: number | null;
};

type ExtraRegionsData = {
  regions: Region[];
};

const neighbors = [
  { y: -1, x: 0 },
  { y: 1, x: 0 },
  { y: 0, x: -1 },
  { y: 0, x: 1 },
];

export const extraRegionsRule: Rule<ExtraRegionsState, ExtraRegionsData> = {
  name: "extraRegions",
  initialState: { currentRegion: null, selectedRegionId: null },
  initialData: () => ({
    regions: [],
  }),
  eventTypes: ["cellMouseDown", "cellMouseMove", "mouseUp"],
  reducer: (state, data, event, info) => {
    return reducerForRegions(state, data, event, info, true, info.boardSize);
  },
  render: (state, data, options) => {
    const cellItems: ReactElement[] = [];
    const borderItems: ReactElement[] = [];

    const addRegion = (
      region: Region,
      i: number,
      cellColor: string,
      borderColor: string,
    ) => {
      for (const cell of region.cells) {
        cellItems.push(
          <rect
            key={`extra-region-${i}-${cell.y}-${cell.x}`}
            x={options.margin + cell.x * options.cellSize}
            y={options.margin + cell.y * options.cellSize}
            width={options.cellSize}
            height={options.cellSize}
            fill={cellColor}
            stroke="none"
          />,
        );
      }

      for (const cell of region.cells) {
        for (const neighbor of neighbors) {
          // check if the neighbor cell is part of the region
          const neighborY = cell.y + neighbor.y;
          const neighborX = cell.x + neighbor.x;
          const hasNeighbor = region.cells.some(
            (c) => c.y === neighborY && c.x === neighborX,
          );
          if (!hasNeighbor) {
            // add a dotted line (border) between the cell and the neighbor

            const midY =
              options.margin +
              (cell.y + 0.5 + neighbor.y * 0.4) * options.cellSize;
            const midX =
              options.margin +
              (cell.x + 0.5 + neighbor.x * 0.4) * options.cellSize;

            const startY = midY + neighbor.x * 0.4 * options.cellSize;
            const startX = midX + neighbor.y * 0.4 * options.cellSize;
            const endY = midY - neighbor.x * 0.4 * options.cellSize;
            const endX = midX - neighbor.y * 0.4 * options.cellSize;

            const strokeDasharray = `${(options.cellSize * 0.8) / 6},${(options.cellSize * 0.8) / 9}`;
            borderItems.push(
              <line
                key={`extra-region-border-${i}-${cell.y}-${cell.x}-${neighborY}-${neighborX}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={borderColor}
                strokeWidth={1}
                strokeDasharray={strokeDasharray}
              />,
            );
          }
        }
      }
    };

    for (let i = 0; i < data.regions.length; ++i) {
      const region = data.regions[i];
      addRegion(
        region,
        i,
        i === state?.selectedRegionId
          ? "rgb(255, 206, 206)"
          : "rgb(216, 216, 216)",
        i === state?.selectedRegionId ? "red" : "black",
      );
    }
    if (state !== null && state.currentRegion) {
      addRegion(state.currentRegion, -1, "rgb(255, 206, 206)", "red");
    }

    return [
      {
        priority: PRIORITY_EXTRA_REGION_BORDER,
        item: <g>{borderItems}</g>,
      },
      {
        priority: PRIORITY_EXTRA_REGION,
        item: <g>{cellItems}</g>,
      },
    ];
  },
};
