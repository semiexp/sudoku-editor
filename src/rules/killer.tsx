import { ReactElement } from "react";
import { Rule, PRIORITY_KILLER } from "../rule";
import { reducerForRegions } from "./regionsUtil";

type Region = { cells: { y: number; x: number }[]; extraValue?: number | null };

type KillerState = {
  currentRegion: Region | null;
  selectedRegionId: number | null;
};

type KillerData = {
  regions: Region[];
};

const neighbors = [
  { y: -1, x: 0 },
  { y: 1, x: 0 },
  { y: 0, x: -1 },
  { y: 0, x: 1 },
];

export const killerRule: Rule<KillerState, KillerData> = {
  name: "killer",
  initialState: { currentRegion: null, selectedRegionId: null },
  initialData: (size: number) => ({
    regions: [],
    size,
  }),
  eventTypes: ["cellMouseDown", "cellMouseMove", "mouseUp", "keyDown"],
  reducer: (state, data, event, info) => {
    if (event.type === "keyDown") {
      if (state.selectedRegionId === null) {
        return {};
      }

      // if key is a number
      if (event.key.match(/^[0-9]$/)) {
        const newRegions = [...data.regions];
        const region = newRegions[state.selectedRegionId];
        const newSum = (region.extraValue ?? 0) * 10 + parseInt(event.key, 10);
        if (newSum > 9 * region.cells.length) {
          return {};
        }
        newRegions[state.selectedRegionId] = {
          ...region,
          extraValue: newSum,
        };
        return { data: { ...data, regions: newRegions } };
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        const newRegions = [...data.regions];
        const region = newRegions[state.selectedRegionId];
        newRegions[state.selectedRegionId] = {
          ...region,
          extraValue: null,
        };
        return { data: { ...data, regions: newRegions } };
      }
    }

    return reducerForRegions(state, data, event, info, true);
  },
  render: (state, data, options) => {
    const items: ReactElement[] = [];

    const addRegion = (region: Region, i: number, color: string) => {
      let smallestCell = region.cells[0];

      for (const cell of region.cells) {
        if (
          cell.y < smallestCell.y ||
          (cell.y === smallestCell.y && cell.x < smallestCell.x)
        ) {
          smallestCell = cell;
        }
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
            items.push(
              <line
                key={`killer-border-${i}-${cell.y}-${cell.x}-${neighborY}-${neighborX}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={color}
                strokeWidth={1}
                strokeDasharray={strokeDasharray}
              />,
            );
          }
        }
      }

      if (region.extraValue !== null) {
        const textY =
          options.margin + (smallestCell.y + 0.28) * options.cellSize;
        const textX =
          options.margin + (smallestCell.x + 0.28) * options.cellSize;
        items.push(
          <text
            key={`killer-number-${i}`}
            x={textX}
            y={textY}
            fontSize={options.cellSize * 0.25}
            fill={color}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {region.extraValue}
          </text>,
        );
      }
    };

    for (let i = 0; i < data.regions.length; ++i) {
      const region = data.regions[i];
      addRegion(region, i, i === state?.selectedRegionId ? "red" : "black");
    }
    if (state !== null && state.currentRegion) {
      addRegion(state.currentRegion, -1, "rgb(255, 168, 168)");
    }

    return [
      {
        priority: 0,
        item: <g>{items}</g>,
      },
    ];
  },
};
