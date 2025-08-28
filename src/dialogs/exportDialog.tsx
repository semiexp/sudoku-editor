import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AutoMuiDialog } from "./dialog";
import { Problem } from "../puzzle";
import { exportProblemToPenpa } from "../penpaExporter";
import { solve } from "../solver";

type ExportDialogType = { problem: Problem };
type AnswerMode = "none" | "manual" | "solver";
type SolverResult = "ok" | "noAnswer" | "notUnique";

export const ExportDialog = (props: {
  initialValues: ExportDialogType;
  close: (value?: ExportDialogType) => void;
}) => {
  const { initialValues, close } = props;
  const [exportAnswerMode, setExportAnswerMode] = useState<AnswerMode>("none");
  const [answer, setAnswer] = useState<(number | null)[][] | undefined>(
    undefined,
  );
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);

  const { t } = useTranslation();

  const result = exportProblemToPenpa(initialValues.problem, answer);
  const url = result.status === "ok" ? result.url : null;
  const error = result.status === "error" ? result.reason : null;
  const hasConflicts = result.status === "ok" && result.hasConflicts;

  const setAnswerMode = (mode: AnswerMode) => {
    setExportAnswerMode(mode);
    if (mode === "none") {
      setAnswer(undefined);
    } else if (mode === "manual") {
      const answerRuleData: (number | null)[][] =
        initialValues.problem.ruleData.get("answer").numbers;
      setAnswer(answerRuleData);
    } else if (mode === "solver") {
      const ans = solve(initialValues.problem);

      console.log(ans);
      if (ans === null) {
        setSolverResult("noAnswer");
        setAnswer(undefined);
      } else {
        let isUnique = true;
        for (let y = 0; y < ans.decidedNumbers.length; y++) {
          for (let x = 0; x < ans.decidedNumbers[y].length; x++) {
            if (ans.decidedNumbers[y][x] === null) {
              isUnique = false;
            }
          }
        }

        setSolverResult(isUnique ? "ok" : "notUnique");
        setAnswer(ans.decidedNumbers);
      }
    }
  };

  return (
    <AutoMuiDialog>
      <DialogTitle>{t("ui.export")}</DialogTitle>
      <DialogContent>
        {url !== null && (
          <>
            <Box>
              <FormControl>
                <FormLabel>{t("ui.exportAnswer.title")}</FormLabel>
                <RadioGroup
                  value={exportAnswerMode}
                  onChange={(e) => setAnswerMode(e.target.value as AnswerMode)}
                >
                  <FormControlLabel
                    value="none"
                    control={<Radio />}
                    label={t("ui.exportAnswer.none")}
                  />
                  <FormControlLabel
                    value="manual"
                    control={<Radio />}
                    label={t("ui.exportAnswer.manual")}
                  />
                  <FormControlLabel
                    value="solver"
                    control={<Radio />}
                    label={t("ui.exportAnswer.solver")}
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            <Typography>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {t("ui.openInPenpa")}
              </a>
            </Typography>
            {hasConflicts && (
              <Typography color="error">{t("ui.exportConflicts")}</Typography>
            )}
            {solverResult === "noAnswer" && (
              <Typography color="error">
                {t("ui.exportAnswer.noAnswer")}
              </Typography>
            )}
            {solverResult === "notUnique" && (
              <Typography color="error">
                {t("ui.exportAnswer.notUnique")}
              </Typography>
            )}
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
          </>
        )}
        {url === null && <Typography color="error">{error}</Typography>}
      </DialogContent>
      <DialogActions>
        {url !== null && (
          <Button onClick={() => navigator.clipboard.writeText(url)}>
            {t("ui.copyToClipboard")}
          </Button>
        )}
        <Button onClick={() => close()}>{t("ui.close")}</Button>
      </DialogActions>
    </AutoMuiDialog>
  );
};
