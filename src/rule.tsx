import { ReactElement } from "react";
import { EditorEvent, EditorEventType } from "./events";
import { BoardData } from "./penpaExporter";

export type RenderOptions = {
  boardSize: number;
  cellSize: number;
  margin: number;
};

export type ReducerInfo = {
  boardSize: number;
};

export interface Rule<State, Data> {
  name: string;
  initialState: State;
  initialData: (size: number, blockWidth: number) => Data;
  booleanFlags?: string[];
  eventTypes: EditorEventType[];
  reducer: (
    state: State,
    data: Data,
    event: EditorEvent,
    info: ReducerInfo,
  ) => {
    state?: State;
    data?: Data;
  };
  render: (
    state: State | null,
    data: Data,
    options: RenderOptions,
  ) => {
    priority: number;
    item: ReactElement;
  }[];
  exportToPenpa: (data: Data) => BoardData;
}

export const PRIORITY_EXTRA_REGION = -200;
export const PRIORITY_SELECTED_CELL_MARKER = -100;
export const PRIORITY_THERMO = -10;
export const PRIORITY_ARROW = -10;
export const PRIORITY_PALINDROME = -10;
export const PRIORITY_BORDER = 0;
export const PRIORITY_DIAGNOAL = 10;
export const PRIORITY_ODD_EVEN = 50;
export const PRIORITY_XV = 50;
export const PRIORITY_CONSECUTIVE = 60;
export const PRIORITY_KILLER = 60;
export const PRIORITY_EXTRA_REGION_BORDER = 60;
export const PRIORITY_FORBIDDEN_CANDIDATES = 99;
export const PRIORITY_CLUE_NUMBERS = 100;
export const PRIORITY_SKYSCRAPERS_NUMBERS = 100;
export const PRIORITY_XSUMS_NUMBERS = 100;
