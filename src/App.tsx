import React from "react";
import "./App.css";
import { useWeb3Session } from "hooks/web3";
import { injected } from "connectors";

function App() {
  const { activate, active, account } = useWeb3Session();

  async function onLogin() {
    try {
      await activate(injected, undefined, true);
    } catch (err) {
      console.error("error login in", err);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        {active ? (
          <span>{account}</span>
        ) : (
          <button type="button" onClick={onLogin}>
            Log In with Metamask
          </button>
        )}
      </header>
    </div>
  );
}

export default App;
