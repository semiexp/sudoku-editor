import { useTranslation } from "react-i18next";

import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { AutoMuiDialog } from "./dialog";

export const helpDialog = (props: {
  initialValues: {};
  close: (value?: {}) => void;
}) => {
  const close = props.close;

  const { t } = useTranslation();

  return (
    <AutoMuiDialog>
      <DialogContent>
        <Typography variant="h5">{t("help.usage.title")}</Typography>
        <Typography>{t("help.usage.content1")}</Typography>
        <Typography>{t("help.usage.content2")}</Typography>
        <Typography>{t("help.usage.content3")}</Typography>
        <Typography variant="h5">{t("help.disclaimer.title")}</Typography>
        <Typography>{t("help.disclaimer.content")}</Typography>

        <Typography>
          <a href="licenses.txt">{t("help.licenses")}</a>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()}>{t("ui.close")}</Button>
      </DialogActions>
    </AutoMuiDialog>
  );
};
