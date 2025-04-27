import { EditorEvent } from "../events";
import { ReducerInfo } from "../rule";

type Pos = { x: number; y: number };

export const reducerForLines = <
  SK extends string,
  DK extends string,
  S extends Record<SK, Pos[] | null>,
  D extends Record<DK, Pos[][]>,
>(
  state: S,
  data: D,
  stateKey: SK,
  dataKey: DK,
  event: EditorEvent,
  info: ReducerInfo,
): { state?: S; data?: D } => {
  const size = info.boardSize;
  if (event.type === "cellMouseDown") {
    if (event.rightClick) {
      const newArrows = data[dataKey].filter(
        (line) =>
          !line.some((cell) => cell.y === event.y && cell.x === event.x),
      );
      return { data: { ...data, [dataKey]: newArrows } };
    }
    if (
      state[stateKey] === null &&
      0 <= event.y &&
      event.y < size &&
      0 <= event.x &&
      event.x < size
    ) {
      const newLine = [{ y: event.y, x: event.x }];
      return { state: { ...state, [stateKey]: newLine } };
    }
  } else if (event.type === "cellMouseMove") {
    if (
      state[stateKey] != null &&
      0 <= event.y &&
      event.y < size &&
      0 <= event.x &&
      event.x < size
    ) {
      const line = state[stateKey];

      const last = line[line.length - 1];
      if (
        (last.y != event.y || last.x != event.x) &&
        Math.abs(last.y - event.y) <= 1 &&
        Math.abs(last.x - event.x) <= 1
      ) {
        if (
          line.length >= 2 &&
          line[line.length - 2].y === event.y &&
          line[line.length - 2].x === event.x
        ) {
          return { state: { ...state, [stateKey]: line.slice(0, -1) } };
        } else {
          const newLine = [...line, { y: event.y, x: event.x }];
          return { state: { ...state, [stateKey]: newLine } };
        }
      }
    }
  } else if (event.type === "mouseUp") {
    if (state[stateKey] != null && state[stateKey].length >= 2) {
      return {
        state: { ...state, [stateKey]: null },
        data: {
          ...data,
          [dataKey]: [...data[dataKey], state[stateKey]],
        },
      };
    }
  }
  return {};
};
