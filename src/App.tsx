import { useEffect, useMemo, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { ethers } from "ethers";
import { range } from "lodash";
import "./App.css";
import { useWeb3Session } from "hooks/web3";
import { injected } from "connectors";
import CarolusNFTV1Artifact from "abi/CarolusNFTV1.json";
import type { CarolusNFTV1 } from "typechain/CarolusNFTV1.d";
import Button from "@mui/material/Button";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import LoadingButton from "@mui/lab/LoadingButton";
import {useContractV1, useNews, useNewsForceUpdate} from "dal/contractV1";

export default function App() {
  const { activate, active, account } = useWeb3Session();
  const [open, setOpen] = useState(false);
  const contract = useContractV1();

  async function onLogin() {
    try {
      await activate(injected, undefined, true);
    } catch (err) {
      console.error("error login in", err);
    }
  }

  const {data: news = [], isLoading} = useNews()
  const forceUpdateNews = useNewsForceUpdate()


  async function onPublish(content: string) {
    if (!contract) {
      throw new Error("contract is undef");
    }

    try {
      const tx = await contract.publishMint(content, {
        value: ethers.constants.WeiPerEther.div(2),
      });
      const receipt = await tx.wait();
      if (!receipt.status) {
        throw new Error();
      }
      setOpen(false);
      forceUpdateNews()
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="App">
      <Header onWrite={() => setOpen(true)} />
      <WriteDialog
        open={open}
        onClose={() => setOpen(false)}
        onPublish={onPublish}
      />
      <header className="App-header">
        {active ? (
          <span>{account}</span>
        ) : (
          <Button type="button" onClick={onLogin}>
            Log In with Metamask
          </Button>
        )}
      </header>

      <main>
        {isLoading && <p>Loading...</p>}
        <List>
          {[...news].reverse().map((news) => {
            return (
              <ListItem key={news.tokenId}>
                <ListItemButton>
                  <ListItemText
                    primary={`${news.content.slice(0, 50)}`}
                    secondary={`by ${news.author} on ${news.date.toISOString()}`}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </main>
    </div>
  );
}



export function Header(props: { onWrite: () => void }) {
  const [anchorEl, setAnchorEl] = useState<
    (EventTarget & HTMLButtonElement) | undefined
  >();

  function onClose() {
    setAnchorEl(undefined);
  }

  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: "10px" }}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <MenuIcon />
        </IconButton>

        <Menu
          sx={{ mt: "45px" }}
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={onClose}
        >
          {["Profile", "Account", "Dashboard", "Logout"].map((setting) => (
            <MenuItem key={setting} onClick={onClose}>
              <Typography textAlign="center">{setting}</Typography>
            </MenuItem>
          ))}
        </Menu>

        <Typography variant="h5" component="div">
          Carolus
        </Typography>
        <Button color="inherit" onClick={props.onWrite}>
          Write
        </Button>
        <div style={{ flexGrow: 1 }} />
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  );
}

function WriteDialog(props: {
  open: boolean;
  onClose: () => void;
  onPublish: (content: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = value.length > 10;

  return (
    <Dialog
      open={props.open}
      keepMounted
      onClose={props.onClose}
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
          onClick={props.onClose}
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
