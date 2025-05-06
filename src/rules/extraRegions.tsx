import {
  Rule,
  PRIORITY_EXTRA_REGION,
  PRIORITY_EXTRA_REGION_BORDER,
} from "../rule";
import { reducerForRegions, rendererForRegions } from "./regionsUtil";

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
};
