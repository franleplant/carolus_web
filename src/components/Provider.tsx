import { Web3ReactProvider } from "@web3-react/core";
import { QueryClient, QueryClientProvider } from "react-query";

import getLibrary from "getLibrary";
import { useEagerConnect } from "hooks/web3";

const queryClient = new QueryClient();

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false;
}

export interface IProps {
  children: JSX.Element;
}

export default function Providers(props: IProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3Manager />
        {props.children}
      </Web3ReactProvider>
    </QueryClientProvider>
  );
}

export function Web3Manager() {
  const triedEager = useEagerConnect();

  return null;
}
