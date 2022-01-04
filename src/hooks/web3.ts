import { useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";
import { injected } from "connectors";

/**
 * Main entry point to the logged in wallet
 */
export function useWeb3Session(): Web3ReactContextInterface<Web3Provider> {
  const context = useWeb3React<Web3Provider>();
  return context;
}

export function useEagerConnect() {
  const { activate, active } = useWeb3React();
  const [tried, setTried] = useState(false);

  // try connecting to an injected connector
  useEffect(() => {
    async function effect() {
      if (active) {
        return;
      }

      const isAuthorized = await injected.isAuthorized();
      if (isAuthorized || window.ethereum) {
        try {
          console.log("unicors");
          await activate(injected, undefined, true);
        } catch (err) {
          console.log("unicors fuck", err);
          setTried(true);
        }
      } else {
        setTried(true);
      }
    }

    effect();
  }, [activate, active]);

  // wait until we get confirmation of a connection to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);

  return tried;
}
