import { EditorEvent } from "../events";
import { ReducerInfo } from "../rule";

export type Outside = "up" | "down" | "left" | "right";
export type SelectedOutsiceCell = {
  side: Outside;
  pos: number;
};

export const reducerForOutsideCell = <
  S extends { selectedOutsideCell: SelectedOutsiceCell | null },
>(
  state: S,
  event: EditorEvent,
  info: ReducerInfo,
): { state?: S } => {
  const size = info.boardSize;

  if (event.type === "cellMouseDown") {
    if (event.y === -1 && 0 <= event.x && event.x < size) {
      return {
        state: {
          ...state,
          selectedOutsideCell: { side: "up", pos: event.x },
        },
      };
    }
    if (event.y === size && 0 <= event.x && event.x < size) {
      return {
        state: {
          ...state,
          selectedOutsideCell: { side: "down", pos: event.x },
        },
      };
    }
    if (event.x === -1 && 0 <= event.y && event.y < size) {
      return {
        state: {
          ...state,
          selectedOutsideCell: { side: "left", pos: event.y },
        },
      };
    }
    if (event.x === size && 0 <= event.y && event.y < size) {
      return {
        state: {
          ...state,
          selectedOutsideCell: { side: "right", pos: event.y },
        },
      };
    }
    return {};
  }

  return {};
};
