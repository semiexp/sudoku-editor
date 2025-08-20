import { useTranslation } from "react-i18next";

import {
  Button,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import { AutoMuiDialog } from "./dialog";

export const HelpDialog = (props: {
  initialValues: unknown;
  close: (value?: unknown) => void;
}) => {
  const close = props.close;

  const { t } = useTranslation();

  const sudokuEditorVersion = document
    .querySelector('meta[name="revision-sudoku-editor"]')
    ?.getAttribute("content");
  const cspuzCoreVersion = document
    .querySelector('meta[name="revision-cspuz-core"]')
    ?.getAttribute("content");
  const buildDate = document
    .querySelector('meta[name="build-date"]')
    ?.getAttribute("content");

  return (
    <AutoMuiDialog>
      <DialogContent>
        <Typography variant="h5">{t("help.usage.title")}</Typography>
        <Typography>{t("help.usage.content1")}</Typography>
        <Typography>{t("help.usage.content2")}</Typography>
        <Typography>{t("help.usage.content3")}</Typography>
        <Typography variant="h5">{t("help.disclaimer.title")}</Typography>
        <Typography>{t("help.disclaimer.content")}</Typography>

        <Typography variant="h5">{t("help.versions")}</Typography>
        <Typography>
          {sudokuEditorVersion && (
            <>
              <a href="https://github.com/semiexp/sudoku-editor">
                sudoku-editor
              </a>
              : {sudokuEditorVersion} <br />
            </>
          )}
          {cspuzCoreVersion && (
            <>
              <a href="https://github.com/semiexp/cspuz_core">cspuz-core</a>:{" "}
              {cspuzCoreVersion} <br />
            </>
          )}
          {buildDate && (
            <>
              {t("help.buildDate")}: {buildDate} <br />
            </>
          )}
        </Typography>

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
