import React, { useEffect } from "react";

export type EditorEvent =
  | {
      type: "cellMouseDown";
      y: number;
      x: number;
      rightClick: boolean;
      shift: boolean;
    }
  | { type: "cellMouseMove"; y: number; x: number }
  | {
      type: "edgeMouseDown";
      y: number;
      x: number;
      direction: "horizontal" | "vertical";
    }
  | { type: "mouseUp" }
  | { type: "keyDown"; key: string };

export type EditorEventType =
  | "cellMouseDown"
  | "cellMouseMove"
  | "edgeMouseDown"
  | "mouseUp"
  | "keyDown";

export const handleKeyDown = (
  e: KeyboardEvent,
  dispatch: ((event: EditorEvent) => void) | null,
) => {
  if (dispatch === null) {
    return;
  }

  const event: EditorEvent = { type: "keyDown", key: e.key };
  dispatch(event);
};

const getCoordinatesFromEvent = (
  clientX: number,
  clientY: number,
  currentTarget: Element,
  margin: number,
) => {
  const rect = currentTarget.getBoundingClientRect();
  const px = clientX - rect.left - margin;
  const py = clientY - rect.top - margin;
  return { px, py };
};

const handlePointerDown = (
  px: number,
  py: number,
  cellSize: number,
  rightClick: boolean,
  shift: boolean,
  dispatch: ((event: EditorEvent) => void) | null,
) => {
  if (dispatch === null) {
    return;
  }

  // cell
  {
    const x = Math.floor(px / cellSize);
    const y = Math.floor(py / cellSize);

    const event: EditorEvent = {
      type: "cellMouseDown",
      x,
      y,
      rightClick,
      shift,
    };
    dispatch(event);
  }

  // edge
  {
    const x = Math.floor(px / cellSize);
    const y = Math.floor(py / cellSize);

    const edgeCands: {
      x: number;
      y: number;
      direction: "horizontal" | "vertical";
      distance: number;
    }[] = [
      { x: x, y: y, direction: "horizontal", distance: py - y * cellSize },
      { x: x, y: y, direction: "vertical", distance: px - x * cellSize },
      {
        x: x,
        y: y + 1,
        direction: "horizontal",
        distance: (y + 1) * cellSize - py,
      },
      {
        x: x + 1,
        y: y,
        direction: "vertical",
        distance: (x + 1) * cellSize - px,
      },
    ];

    const minEdge = edgeCands.reduce((prev, curr) => {
      if (prev.distance < curr.distance) {
        return prev;
      } else {
        return curr;
      }
    });

    if (minEdge.distance < cellSize * 0.3) {
      const event: EditorEvent = {
        type: "edgeMouseDown",
        x: minEdge.x,
        y: minEdge.y,
        direction: minEdge.direction,
      };
      dispatch(event);
    }
  }
};

export const handleMouseDown = (
  e: React.MouseEvent<Element, MouseEvent>,
  cellSize: number,
  margin: number,
  dispatch: ((event: EditorEvent) => void) | null,
) => {
  const { px, py } = getCoordinatesFromEvent(
    e.clientX,
    e.clientY,
    e.currentTarget,
    margin,
  );
  const rightClick = e.button === 2;
  handlePointerDown(px, py, cellSize, rightClick, e.shiftKey, dispatch);
};

const handlePointerMove = (
  px: number,
  py: number,
  cellSize: number,
  dispatch: ((event: EditorEvent) => void) | null,
) => {
  if (dispatch === null) {
    return;
  }

  // cell
  {
    const x = Math.floor(px / cellSize);
    const y = Math.floor(py / cellSize);

    const gap = Math.min(
      px - x * cellSize,
      (x + 1) * cellSize - px,
      py - y * cellSize,
      (y + 1) * cellSize - py,
    );
    if (gap > cellSize * 0.15) {
      const event: EditorEvent = { type: "cellMouseMove", x: x, y: y };
      dispatch(event);
    }
  }
};

export const handleMouseMove = (
  e: React.MouseEvent<Element, MouseEvent>,
  cellSize: number,
  margin: number,
  dispatch: ((event: EditorEvent) => void) | null,
) => {
  const { px, py } = getCoordinatesFromEvent(
    e.clientX,
    e.clientY,
    e.currentTarget,
    margin,
  );
  handlePointerMove(px, py, cellSize, dispatch);
};

export const handleMouseUp = (
  dispatch: ((event: EditorEvent) => void) | null,
) => {
  if (dispatch === null) {
    return;
  }

  const event: EditorEvent = { type: "mouseUp" };
  dispatch(event);
};

export const handleTouchStart = (
  e: React.TouchEvent<Element>,
  cellSize: number,
  margin: number,
  dispatch: ((event: EditorEvent) => void) | null,
) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    const { px, py } = getCoordinatesFromEvent(
      touch.clientX,
      touch.clientY,
      e.currentTarget,
      margin,
    );
    handlePointerDown(px, py, cellSize, false, false, dispatch);
  }
};

export const handleTouchMove = (
  e: React.TouchEvent<Element>,
  cellSize: number,
  margin: number,
  dispatch: ((event: EditorEvent) => void) | null,
) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    const { px, py } = getCoordinatesFromEvent(
      touch.clientX,
      touch.clientY,
      e.currentTarget,
      margin,
    );
    handlePointerMove(px, py, cellSize, dispatch);
  }
};

export const handleTouchEnd = (
  dispatch: ((event: EditorEvent) => void) | null,
) => {
  if (dispatch === null) {
    return;
  }

  const event: EditorEvent = { type: "mouseUp" };
  dispatch(event);
};

export const useKeyDown = (handler: (e: KeyboardEvent) => void) => {
  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  });
};
