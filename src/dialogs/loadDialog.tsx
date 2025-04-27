import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { AutoMuiDialog } from "./dialog";

type LoadDialogType = { content: string };

export const LoadDialog = (props: {
  initialValues: LoadDialogType;
  close: (value?: LoadDialogType) => void;
}) => {
  const { initialValues, close } = props;
  const [content, setContent] = useState(initialValues.content);

  const { t } = useTranslation();

  return (
    <AutoMuiDialog>
      <DialogTitle>{t("ui.load")}</DialogTitle>
      <DialogContent>
        <TextField
          value={content}
          multiline
          minRows={10}
          maxRows={10}
          sx={{ width: "100%", minWidth: 400 }}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()}>{t("ui.cancel")}</Button>
        <Button onClick={() => close({ content })}>{t("ui.ok")}</Button>
      </DialogActions>
    </AutoMuiDialog>
  );
};
