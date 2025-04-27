import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { AutoMuiDialog } from "./dialog";

type SaveDialogType = { content: string };

export const SaveDialog = (props: {
  initialValues: SaveDialogType;
  close: (value?: SaveDialogType) => void;
}) => {
  const { initialValues, close } = props;

  const { t } = useTranslation();

  return (
    <AutoMuiDialog>
      <DialogTitle>{t("ui.save")}</DialogTitle>
      <DialogContent>
        <Typography>{t("ui.saveDialogNote")}</Typography>
        <TextField
          value={initialValues.content}
          multiline
          minRows={10}
          maxRows={10}
          sx={{ width: "100%", minWidth: 400 }}
          slotProps={{
            htmlInput: { readOnly: true },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => navigator.clipboard.writeText(initialValues.content)}
        >
          {t("ui.copyToClipboard")}
        </Button>
        <Button onClick={() => close()}>{t("ui.close")}</Button>
      </DialogActions>
    </AutoMuiDialog>
  );
};
