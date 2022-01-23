import { useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";
import { injected } from "connectors";
import { IChainInfo, getChain } from "constants/chains";

export function useChain(): IChainInfo {
  const { chainId } = useWeb3React();
  const chain = getChain(chainId);
  return chain;
}

/**
 * Main entry point to the logged in wallet
 */
export function useWeb3Session(): Web3ReactContextInterface<Web3Provider> {
  const context = useWeb3React<Web3Provider>();
  return context;
}

export function useEagerConnect(): {
  tried: boolean;
  error: string;
} {
  const { activate, active, chainId } = useWeb3React();
  const [tried, setTried] = useState(false);
  const [error, setError] = useState("");

  // try connecting to an injected connector
  useEffect(() => {
    async function effect() {
      if (active) {
        return;
      }

      const isAuthorized = await injected.isAuthorized();
      if (isAuthorized || window.ethereum) {
        try {
          await activate(injected, undefined, true);
        } catch (err) {
          const msg: string = (err as any)?.message || "something went wrong";

          console.log("Error while eager connecting", err);
          setError(msg);
          setTried(true);
        }
      } else {
        setTried(true);
      }
    }

    effect();
  }, [activate, active, chainId]);

  useEffect(() => {
    setError("");
  }, [chainId]);

  // wait until we get confirmation of a connection to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);

  return { tried, error };
}
