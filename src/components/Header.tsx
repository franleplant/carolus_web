import { Link } from "react-router-dom";

import { useChain, useWeb3Session } from "hooks/web3";
import { injected } from "connectors";
import Account from "components/Account";

export interface IProps {}

export default function Header(props: IProps) {
  const { activate, active, account } = useWeb3Session();
  const chain = useChain();

  async function onLogin() {
    try {
      await activate(injected, undefined, true);
    } catch (err) {
      console.error("error login in", err);
    }
  }

  return (
    <header className="flex flex-wrap w-full border-b-2 border-b-paper_fg">
      <Link to="/" className="p-4 text-base hover:drop-shadow-lg">
        Home
      </Link>
      <Link to="/compose" className="p-4 text-base hover:drop-shadow-lg">
        Write
      </Link>
      <div className="flex-1" />

      <span className="p-4 text-sm leading-6">{chain.label}</span>
      {active && account ? (
        <Account
          account={account}
          className="p-4 text-sm leading-6"
          firstChunkSize={Infinity}
        />
      ) : (
        <button onClick={onLogin} className="p-4">
          Login
        </button>
      )}
    </header>
  );
}
