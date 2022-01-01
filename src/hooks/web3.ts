import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";

/**
 * Main entry point to the logged in wallet
 */
export function useWeb3Session(): Web3ReactContextInterface<Web3Provider> {
  const context = useWeb3React<Web3Provider>();
  return context;
}
