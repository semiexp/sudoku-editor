import {
  Rule,
  PRIORITY_EXTRA_REGION,
  PRIORITY_EXTRA_REGION_BORDER,
} from "../rule";
import { reducerForRegions, rendererForRegions } from "./regionsUtil";
import { Item } from "../penpaExporter";

type Region = { cells: { y: number; x: number }[] };

type ExtraRegionsState = {
  currentRegion: Region | null;
  selectedRegionId: number | null;
};

type ExtraRegionsData = {
  regions: Region[];
};

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
    return rendererForRegions(
      state,
      data,
      options,
      PRIORITY_EXTRA_REGION,
      PRIORITY_EXTRA_REGION_BORDER,
    );
  },
  exportToPenpa: (data) => {
    const items: Item[] = [];

    for (const region of data.regions) {
      items.push({
        kind: "region",
        cells: region.cells,
        style: 16,
      });
      for (const cell of region.cells) {
        items.push({
          kind: "cell",
          position: cell,
          style: 3,
        });
      }
    }

    return { items, margin: 0 };
  },
};
