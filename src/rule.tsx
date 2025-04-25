import { ReactElement } from "react";

export type EditorEvent =
  | { type: "cellMouseDown"; y: number; x: number }
  | { type: "edgeMouseDown"; y: number; x: number; direction: "horizontal" | "vertical" }
  | { type: "keyDown"; key: string };

export type EditorEventType = "cellMouseDown" | "edgeMouseDown" | "keyDown";

export type RenderOptions = {
  cellSize: number;
  margin: number;
};

export interface Rule<State, Data> {
  name: string;
  title: string;
  initialState: State;
  initialData: (size: number) => Data;
  eventTypes: EditorEventType[];
  reducer: (state: State, data: Data, event: EditorEvent) => {
    state?: State;
    data?: Data;
  };
  render: (state: State | null, data: Data, options: RenderOptions) => {
    priority: number;
    item: ReactElement;
  }[];
};

export const PRIORITY_SELECTED_CELL_MARKER = -100;
export const PRIORITY_BORDER = 0;
export const PRIORITY_ODD_EVEN = 50;
export const PRIORITY_CLUE_NUMBERS = 100;
