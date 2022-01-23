import React, { useContext } from "react";
import { ethers } from "ethers";
import { useWeb3React, Web3ReactProvider } from "@web3-react/core";
import { QueryClient, QueryClientProvider } from "react-query";

import getLibrary from "getLibrary";
import { useChain, useEagerConnect } from "hooks/web3";
import { SupportedChainId } from "constants/chains";

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
        <Web3Manager>
          <DefaultRpcProvider>{props.children}</DefaultRpcProvider>
        </Web3Manager>
      </Web3ReactProvider>
    </QueryClientProvider>
  );
}

export function Web3Manager({ children }: { children: any }) {
  const { chainId } = useWeb3React();
  const { tried, error } = useEagerConnect();

  if (chainId) {
    const chain = SupportedChainId[Number(chainId)];
    if (!chain) {
      return <div>Unsupported chain, please use Polygon</div>;
    }
  }

  if (error.includes("Unsupported chain")) {
    return <div>Unsupported chain, please use Polygon</div>;
  }
  return children;
}

export interface IProviderContext {
  provider?: ethers.providers.JsonRpcProvider;
}

export const ProviderContext = React.createContext<IProviderContext>({});

export function useProvider(): IProviderContext {
  const context = useContext(ProviderContext);

  return context;
}

export function DefaultRpcProvider({ children }: { children: any }) {
  const { chainId } = useWeb3React();
  const chain = useChain();

  const provider = new ethers.providers.JsonRpcProvider(
    { url: chain.rpc },
    chainId
  );

  return (
    <ProviderContext.Provider value={{ provider }}>
      {children}
    </ProviderContext.Provider>
  );
}
