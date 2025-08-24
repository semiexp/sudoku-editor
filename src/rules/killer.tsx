import { ReactElement } from "react";
import { Rule, PRIORITY_KILLER } from "../rule";
import { reducerForRegions, rendererForRegions } from "./regionsUtil";
import { Item } from "../penpaExporter";

type Region = { cells: { y: number; x: number }[]; extraValue?: number | null };

type KillerState = {
  currentRegion: Region | null;
  selectedRegionId: number | null;
};

type KillerData = {
  regions: Region[];
  distinct: boolean;
};

export const killerRule: Rule<KillerState, KillerData> = {
  name: "killer",
  initialState: { currentRegion: null, selectedRegionId: null },
  initialData: () => ({
    regions: [],
    distinct: true,
  }),
  booleanFlags: ["distinct"],
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

    const ret = rendererForRegions(state, data, options, null, PRIORITY_KILLER);
    ret.push({
      priority: PRIORITY_KILLER,
      item: <g>{items}</g>,
    });
    return ret;
  },
  exportToPenpa: (data) => {
    const items: Item[] = [];

    for (const region of data.regions) {
      items.push({
        kind: "region",
        cells: region.cells,
        style: 10,
      });

      if (
        region.cells.length > 0 &&
        region.extraValue !== null &&
        region.extraValue !== undefined
      ) {
        const smallestCell = region.cells.reduce((a, b) =>
          a.y < b.y || (a.y === b.y && a.x < b.x) ? a : b,
        );
        items.push({
          kind: "smallText",
          position: { y: smallestCell.y, x: smallestCell.x, position: "ul" },
          value: region.extraValue.toString(),
          style: 1,
        });
      }
    }

    return { items, margin: 0 };
  },
};
