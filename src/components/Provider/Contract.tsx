import { useContractV1 } from "hooks/contract";
import { createContext, useContext } from "react";
import type { CarolusNFTV1 } from "typechain/CarolusNFTV1.d";

export interface IContractContext {
  contractV1: CarolusNFTV1 | null;
}

export const ContractContext = createContext<IContractContext>({
  contractV1: null,
});

export default function ContractProvider({ children }: { children: any }) {
  const contractV1 = useContractV1();

  return (
    <ContractContext.Provider value={{ contractV1 }}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContractContext(): IContractContext {
  const context = useContext(ContractContext);

  return context;
}
