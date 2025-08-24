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
import { Problem } from "../puzzle";
import { exportProblemToPenpa } from "../penpaExporter";

type ExportDialogType = { problem: Problem };

export const ExportDialog = (props: {
  initialValues: ExportDialogType;
  close: (value?: ExportDialogType) => void;
}) => {
  const { initialValues, close } = props;

  const { t } = useTranslation();

  const url = exportProblemToPenpa(initialValues.problem);

  return (
    <AutoMuiDialog>
      <DialogTitle>{t("ui.export")}</DialogTitle>
      <DialogContent>
        <Typography>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {t("ui.openInPenpa")}
          </a>
        </Typography>
        <TextField
          value={url}
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
        <Button onClick={() => navigator.clipboard.writeText(url)}>
          {t("ui.copyToClipboard")}
        </Button>
        <Button onClick={() => close()}>{t("ui.close")}</Button>
      </DialogActions>
    </AutoMuiDialog>
  );
};
