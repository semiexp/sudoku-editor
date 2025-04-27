import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { AutoMuiDialog } from "./dialog";

type SaveDialogType = { content: string };

export const SaveDialog = (props: {
  initialValues: SaveDialogType;
  close: (value?: SaveDialogType) => void;
}) => {
  const { initialValues, close } = props;

  return (
    <AutoMuiDialog>
      <DialogTitle>Save</DialogTitle>
      <DialogContent>
        <Typography>Note: data for unselected rules will be lost.</Typography>
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
          Copy to clipboard
        </Button>
        <Button onClick={() => close()}>OK</Button>
      </DialogActions>
    </AutoMuiDialog>
  );
};
