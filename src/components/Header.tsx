import { useState } from "react";

import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { useWeb3Session } from "hooks/web3";
import { injected } from "connectors";

export interface IProps {
  onWrite: () => void;
}

export default function Header(props: IProps) {
  const { activate, active, account } = useWeb3Session();

  async function onLogin() {
    try {
      await activate(injected, undefined, true);
    } catch (err) {
      console.error("error login in", err);
    }
  }

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
        {active ? (
          <Typography variant="h6" component="div">
            {account}
          </Typography>
        ) : (
          <Button color="inherit" onClick={onLogin}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
