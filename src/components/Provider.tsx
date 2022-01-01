import { Web3ReactProvider } from "@web3-react/core";

import getLibrary from "getLibrary";

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false;
}

export interface IProps {
  children: JSX.Element;
}

export default function Providers(props: IProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      {props.children}
    </Web3ReactProvider>
  );
}
