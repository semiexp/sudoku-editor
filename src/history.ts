import { useState } from "react";

export const useHistory = <T>(current: T, onChange: (data: T) => void) => {
  const [undoStack, setUndoStack] = useState<T[]>([]);
  const [redoStack, setRedoStack] = useState<T[]>([]);

  const undo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, current]);
    setUndoStack((prev) => prev.slice(0, -1));
    onChange(previous);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, current]);
    setRedoStack((prev) => prev.slice(0, -1));
    onChange(next);
  };

  const update = (newData: T) => {
    setUndoStack((prev) => [...prev, current]);
    setRedoStack([]);
    onChange(newData);
  };

  const reset = (newData: T) => {
    setUndoStack([]);
    setRedoStack([]);
    onChange(newData);
  };

  return {
    undo,
    redo,
    update,
    reset,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
};
