import { useMemo } from "react";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import CarolusNFTV1Artifact from "abi/CarolusNFTV1.json";
import type { CarolusNFTV1 } from "typechain/CarolusNFTV1.d";
import { getChain } from "constants/chains";
import { useProvider } from "components/Provider";
import { useWeb3Session } from "hooks/web3";

export function useContractV1(): CarolusNFTV1 | null {
  const { account, library } = useWeb3Session();
  const chain = getChain();
  const { provider } = useProvider();
  const contractAddress = chain.contractAddress;

  return useMemo(() => {
    if (!provider) {
      return null;
    }

    console.log("using contract", contractAddress);

    try {
      let signerOrProvider: ethers.Signer | ethers.providers.Provider =
        provider;
      if (account && library) {
        signerOrProvider = library.getSigner(account).connectUnchecked();
      }
      const contract = new Contract(
        contractAddress,
        CarolusNFTV1Artifact.abi,
        signerOrProvider
      );
      return contract as CarolusNFTV1;
    } catch (err) {
      console.log("error instantiating contract", err);
      return null;
    }
  }, [provider, account, contractAddress, library]);
}
