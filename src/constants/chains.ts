//import ethereumLogoUrl from "assets/images/ethereum-logo.png";
//import arbitrumLogoUrl from "assets/svg/arbitrum_logo.svg";
//import optimismLogoUrl from "assets/svg/optimistic_ethereum.svg";
//import polygonMaticLogo from "assets/svg/polygon-matic-logo.svg";
//import ms from "ms";

//import { ARBITRUM_LIST, OPTIMISM_LIST } from "./lists";

if (
  !process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS_LOCALHOST ||
  !process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS_POLYGON ||
  !process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS_POLYGON_MUMBAI
) {
  throw new Error("missing envs");
}

export enum SupportedChainId {
  POLYGON = 137,
  POLYGON_MUMBAI = 80001,
  HARDHAT_NODE = 31337,
}

/**
 *  * Array of all the supported chain IDs
 *   */
export const ALL_SUPPORTED_CHAIN_IDS: Array<SupportedChainId> = Object.values(
  SupportedChainId
).filter((id) => typeof id === "number") as Array<SupportedChainId>;

export const DEFAULT_CHAIN: SupportedChainId = SupportedChainId.POLYGON;

export interface IChainInfo {
  id: SupportedChainId;
  label: string;
  rpc: string;
  contractAddress: string;
}
export const CHAIN_INFO: Record<SupportedChainId, IChainInfo> = {
  [SupportedChainId.POLYGON]: {
    //networkType: NetworkType.L1,
    //blockWaitMsBeforeWarning: ms("10m"),
    //bridge: "https://wallet.polygon.technology/bridge",
    //docs: "https://polygon.io/",
    //explorer: "https://polygonscan.com/",
    //infoLink: "https://info.uniswap.org/#/polygon/",
    id: SupportedChainId.POLYGON,
    label: "Polygon",
    rpc: "https://polygon-rpc.com",
    contractAddress: process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS_POLYGON,
    //logoUrl: polygonMaticLogo,
    //addNetworkInfo: {
    //rpcUrl: "https://polygon-rpc.com/",
    //nativeCurrency: { name: "Polygon Matic", symbol: "MATIC", decimals: 18 },
    //},
  },
  [SupportedChainId.POLYGON_MUMBAI]: {
    //networkType: NetworkType.L1,
    //blockWaitMsBeforeWarning: ms("10m"),
    //bridge: "https://wallet.polygon.technology/bridge",
    //docs: "https://polygon.io/",
    //explorer: "https://mumbai.polygonscan.com/",
    //infoLink: "https://info.uniswap.org/#/polygon/",
    id: SupportedChainId.POLYGON_MUMBAI,
    label: "Polygon Mumbai",
    rpc: "https://polygon-mumbai.g.alchemy.com/v2/JJrysE52HncyKHPBFiDN__ZRH-BvPPqw",
    contractAddress:
      process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS_POLYGON_MUMBAI,
    //logoUrl: polygonMaticLogo,
    //addNetworkInfo: {
    //nativeCurrency: {
    //name: "Polygon Mumbai Matic",
    //symbol: "mMATIC",
    //decimals: 18,
    //},
    //rpcUrl: "https://rpc-endpoints.superfluid.dev/mumbai",
    //},
  },
  [SupportedChainId.HARDHAT_NODE]: {
    id: SupportedChainId.HARDHAT_NODE,
    label: "Localhost",
    rpc: "http://127.0.0.1:8545",
    contractAddress:
      process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS_LOCALHOST,
  },
};

export function getChain(chainId?: string | number): IChainInfo {
  const chain =
    CHAIN_INFO[Number(chainId) as SupportedChainId] ||
    CHAIN_INFO[DEFAULT_CHAIN];

  return chain;
}
