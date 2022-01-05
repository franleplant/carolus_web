import { Link } from "react-router-dom";

import { useWeb3Session } from "hooks/web3";
import { injected } from "connectors";
import Account from "components/Account";

export interface IProps {}

export default function Header(props: IProps) {
  const { activate, active, account } = useWeb3Session();

  async function onLogin() {
    try {
      await activate(injected, undefined, true);
    } catch (err) {
      console.error("error login in", err);
    }
  }

  return (
    <header className="flex w-full border-b-2 gap-2 border-b-paper_fg">
      <Link to="/" className="p-4">
        Home
      </Link>
      <Link to="/compose" className="p-4">
        Write
      </Link>
      <div className="flex-1" />

      {active && account ? (
        <Account account={account} className="p-4" secondChunkSize={10} />
      ) : (
        <button onClick={onLogin} className="p-4">
          Login
        </button>
      )}
    </header>
  );
}
