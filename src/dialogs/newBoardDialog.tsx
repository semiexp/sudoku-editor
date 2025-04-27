import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";

import { AutoMuiDialog } from "./dialog";

type NewBoardDialogType = { size: number; blockWidth: number };

const sizeCandidates = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

const precomputedBlockOptions: Record<
  number,
  Array<{ width: number; height: number }>
> = (() => {
  const generateBlockOptions = (size: number) => {
    const options = [];
    for (let width = 2; width < size; width++) {
      if (size % width === 0) {
        const height = size / width;
        if (height > 1) {
          options.push({ width, height });
        }
      }
    }
    return options;
  };

  const result: Record<number, Array<{ width: number; height: number }>> = {};
  for (const size of sizeCandidates) {
    result[size] = generateBlockOptions(size);
  }
  return result;
})();

const findDefaultBlockWidth = (size: number) => {
  const options = precomputedBlockOptions[size] || [];
  for (const { width } of options) {
    if (width * width >= size) {
      return width;
    }
  }
  return 0; // Default to no blocks if no suitable option is found
};

export const NewBoardDialog = (props: {
  initialValues: NewBoardDialogType;
  close: (value?: NewBoardDialogType) => void;
}) => {
  const { initialValues, close } = props;
  const [values, setValues] = useState({
    ...initialValues,
    blockWidth: findDefaultBlockWidth(initialValues.size),
  });
  const { t } = useTranslation();

  return (
    <AutoMuiDialog>
      <DialogTitle>{t("ui.newBoard")}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "contents" }}>
            <InputLabel>{t("ui.boardSize")}</InputLabel>
            <Select
              value={values.size}
              onChange={(e) =>
                setValues({
                  ...values,
                  size: parseInt(e.target.value.toString()),
                  blockWidth: findDefaultBlockWidth(
                    parseInt(e.target.value.toString()),
                  ),
                })
              }
            >
              {sizeCandidates.map((size) => (
                <MenuItem key={size} value={size}>
                  {size} x {size}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box sx={{ display: "contents" }}>
            <InputLabel>{t("ui.blockSize")}</InputLabel>
            <Select
              value={values.blockWidth}
              onChange={(e) =>
                setValues({
                  ...values,
                  blockWidth: parseInt(e.target.value.toString()),
                })
              }
            >
              <MenuItem value={0}>{t("ui.noBlocks")}</MenuItem>
              {precomputedBlockOptions[values.size]?.map(
                ({ width, height }) => (
                  <MenuItem key={`${width}x${height}`} value={width}>
                    {width} x {height}
                  </MenuItem>
                ),
              )}
            </Select>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()}>{t("ui.cancel")}</Button>
        <Button onClick={() => close(values)}>{t("ui.ok")}</Button>
      </DialogActions>
    </AutoMuiDialog>
  );
};
