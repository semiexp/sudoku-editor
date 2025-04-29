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
  } else if (event.type === "keyDown" && state.selectedOutsideCell !== null) {
    const side = state.selectedOutsideCell.side;
    if (side === "up" || side === "down") {
      if (event.key === "ArrowLeft") {
        return {
          state: {
            ...state,
            selectedOutsideCell: {
              side,
              pos: (state.selectedOutsideCell.pos - 1 + size) % size,
            },
          },
        };
      } else if (event.key === "ArrowRight") {
        return {
          state: {
            ...state,
            selectedOutsideCell: {
              side,
              pos: (state.selectedOutsideCell.pos + 1) % size,
            },
          },
        };
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        return {
          state: {
            ...state,
            selectedOutsideCell: {
              side: side === "up" ? "down" : "up",
              pos: state.selectedOutsideCell.pos,
            },
          },
        };
      }
    } else if (side === "left" || side === "right") {
      if (event.key === "ArrowUp") {
        return {
          state: {
            ...state,
            selectedOutsideCell: {
              side,
              pos: (state.selectedOutsideCell.pos - 1 + size) % size,
            },
          },
        };
      } else if (event.key === "ArrowDown") {
        return {
          state: {
            ...state,
            selectedOutsideCell: {
              side,
              pos: (state.selectedOutsideCell.pos + 1) % size,
            },
          },
        };
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        return {
          state: {
            ...state,
            selectedOutsideCell: {
              side: side === "left" ? "right" : "left",
              pos: state.selectedOutsideCell.pos,
            },
          },
        };
      }
    }
  }

  return {};
};
