// TODO: make this a separate package
// ref: https://github.com/semiexp/polymate-ui/blob/main/src/dialog.tsx

import { Dialog, DialogProps } from "@mui/material";
import {
  createElement,
  createContext,
  useContext,
  useState,
  ReactElement,
} from "react";
import { createRoot } from "react-dom/client";

const dialogRoots = new Map();
const dialogKey = new Map();
const DialogOpenStateContext = createContext(false);

const DialogWrapper = <T,>(props: {
  dialogImpl: (props: {
    initialValues: T;
    close: (values?: T) => void;
  }) => ReactElement;
  initialValues: T;
  resolve: (value: T | undefined) => void;
}) => {
  const { dialogImpl, initialValues, resolve } = props;
  const [open, setOpen] = useState(true);

  return (
    <DialogOpenStateContext.Provider value={open}>
      {createElement(dialogImpl, {
        initialValues,
        close: (values) => {
          setOpen(false);
          resolve(values);
        },
      })}
    </DialogOpenStateContext.Provider>
  );
};

export const openDialog = <T,>(
  dialogImpl: (props: {
    initialValues: T;
    close: (values: T | undefined) => void;
  }) => ReactElement,
  initialValues: T,
): Promise<T | undefined> => {
  if (!dialogRoots.has(dialogImpl)) {
    const newRootElem = document.createElement("div");
    document.body.appendChild(newRootElem);
    const newRoot = createRoot(newRootElem);
    dialogRoots.set(dialogImpl, newRoot);
    dialogKey.set(dialogImpl, 0);
  }

  const dialogRoot = dialogRoots.get(dialogImpl)!;
  const key = dialogKey.get(dialogImpl)!;
  dialogKey.set(dialogImpl, key ^ 1);

  return new Promise((resolve) => {
    dialogRoot.render(
      <DialogWrapper
        dialogImpl={dialogImpl}
        initialValues={initialValues}
        resolve={resolve}
        key={`${key}`}
      />,
    );
  });
};

export type AutoMuiDialogProps = Omit<DialogProps, "open">;

export const AutoMuiDialog = (props: AutoMuiDialogProps) => {
  const open = useContext(DialogOpenStateContext);
  return createElement(Dialog, { ...props, open }, props.children);
};
