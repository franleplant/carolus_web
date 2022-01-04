import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";

export interface IProps {
  onPublish: (content: string) => Promise<void>;
}
export default function Composer(props: IProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = value.length > 10;

  return (
    <Dialog
      open={true}
      keepMounted
      onClose={() => {}}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"Write your news"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Let Google help apps determine location. This means sending anonymous
          location data to Google, even when no apps are running.
        </DialogContentText>

        <form>
          <TextField
            //error={!isValid}
            multiline
            minRows={10}
            fullWidth
            placeholder="write your uncensorable news"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={loading}
          onClick={() => {}}
          color="error"
          variant="contained"
        >
          Cancel
        </Button>
        <LoadingButton
          loading={loading}
          disabled={!isValid || loading}
          onClick={async () => {
            try {
              setLoading(true);
              await props.onPublish(value);
            } catch (err) {
              console.log(err);
            } finally {
              setLoading(false);
            }
          }}
          color="success"
          variant="contained"
        >
          Publish
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
