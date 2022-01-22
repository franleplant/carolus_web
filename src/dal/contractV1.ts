import { useEffect, useMemo, useRef } from "react";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { range } from "lodash";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";

import CarolusNFTV1Artifact from "abi/CarolusNFTV1.json";
import type { CarolusNFTV1 } from "typechain/CarolusNFTV1.d";
import { useWeb3Session } from "hooks/web3";
import invariant from "ts-invariant";

if (
  !process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS_LOCALHOST ||
  !process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS_POLYGON ||
  !process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS_POLYGON_MUMBAI
) {
  throw new Error("missing envs");
}

// TODO this is aweful, make it better
export const CONTRACT_ADDRESS: Record<number, string> = {
  137: process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS_POLYGON,
  80001: process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS_POLYGON_MUMBAI,
  31337: process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS_LOCALHOST,
};

function getContractAddress(chainId?: number): string {
  if (!chainId) {
    return CONTRACT_ADDRESS[137];
  }

  const address = CONTRACT_ADDRESS[chainId];
  if (!address) {
    throw new Error("bad chainId");
  }

  return address;
}

// TODO abstract
const polygonProvider = new ethers.providers.JsonRpcProvider(
  { url: "https://polygon-rpc.com" },
  137
);
const mumbaiProvider = new ethers.providers.JsonRpcProvider(
  {
    url: "https://polygon-mumbai.g.alchemy.com/v2/JJrysE52HncyKHPBFiDN__ZRH-BvPPqw",
  },
  80001
);
const localhostProvider = new ethers.providers.JsonRpcProvider(
  {
    url: "http://127.0.0.1:8545",
  },
  31337
);

function getProvider(chainId?: number): ethers.providers.JsonRpcProvider {
  switch (chainId) {
    case 137: {
      console.log("using polygon");
      return polygonProvider;
    }
    case 80001: {
      console.log("using mumbai");
      return mumbaiProvider;
    }
    case 31337: {
      console.log("using localhost");
      return localhostProvider;
    }

    default: {
      console.log("using default: polygon");
      return polygonProvider;
    }
  }
}

const DEFAULT_CHAIN_ID = 80001;

//export function usePrevious<T>(value: T): T | undefined {
//const valueRef = useRef(value)
//useEffect(() => {
//valueRef.current = value
//}, [value])

//return valueRef.current
//}

export function useContractV1(): CarolusNFTV1 | null {
  const { account, library, chainId = DEFAULT_CHAIN_ID } = useWeb3Session();
  const contractAddress = getContractAddress(chainId);

  //const prevChainId = usePrevious(chainId)
  //const prevAccount = usePrevious(account)
  //const

  return useMemo(() => {
    try {
      let signerOrProvider: ethers.Signer | ethers.providers.Provider =
        getProvider(chainId);
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
  }, [chainId, account, contractAddress, library]);
}

export interface INewsItem {
  /** the ERC271Enumerable index */
  index: number;
  tokenId: number;
  content: string;
  tokenURI: string;
  author: string;
  date: Date;
}

export async function getNewsItem(
  index: number,
  contract: CarolusNFTV1
): Promise<INewsItem> {
  const tokenId = await contract.tokenByIndex(index);

  const [content, tokenURI, author, timestamp] = await Promise.all([
    contract.contentMap(tokenId),
    contract.tokenURI(tokenId),
    contract.tokenToAuthorMap(tokenId),
    contract.tokenToTimestampMap(tokenId),
  ]);

  return {
    index,
    tokenId: tokenId.toNumber(),
    content,
    tokenURI,
    author,
    date: new Date(timestamp.toNumber() * 1000),
  };
}

export function calcPaging(
  supply: number,
  page: number = 0,
  pageSize: number = 10
): Array<number> {
  if (supply === 0) {
    return [];
  }

  const lastElement = supply - 1;

  const start = lastElement - pageSize * page;
  const end = lastElement - pageSize * (page + 1);
  invariant(start >= end, "start should always be greater or equal to end");
  if (start < 0 && end < 0) {
    throw new Error(
      `out of bound start=${start} end=${end} page=${page} pageSize=${pageSize} supply=${supply}`
    );
  }
  const items = range(Math.max(start, 0), Math.max(end, -1), -1);
  return items;
}

export function useNewsSupply(): UseQueryResult<{ supply: number }> {
  const contract = useContractV1();
  return useQuery({
    queryKey: "news_supply",
    enabled: !!contract,
    queryFn: async () => {
      invariant(contract);
      const supply = (await contract.totalSupply()).toNumber();
      return { supply };
    },
  });
}

export function useNewsItem(index: number): UseQueryResult<INewsItem> {
  const contract = useContractV1();

  return useQuery({
    queryKey: ["news", index],
    enabled: !!contract,
    staleTime: Infinity,
    queryFn: async () => {
      invariant(contract);
      return getNewsItem(index, contract);
    },
  });
}

export function usePublishMint(): UseMutationResult<
  unknown,
  unknown,
  { content: string }
> {
  const contract = useContractV1();
  const queryClient = useQueryClient();
  return useMutation(
    async ({ content }) => {
      invariant(contract);
      const tx = await contract.publishMint(content, {
        value: ethers.constants.WeiPerEther.div(2),
      });
      const receipt = await tx.wait();
      if (!receipt.status) {
        throw new Error();
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("news_supply");
      },
    }
  );
}

export function useVotes(
  tokenId?: number
): UseQueryResult<[upvotes: number, downvotes: number]> {
  const contract = useContractV1();

  return useQuery({
    queryKey: `votes/${tokenId}`,
    enabled: !!contract && typeof tokenId !== "undefined",
    queryFn: async () => {
      invariant(contract);
      invariant(typeof tokenId !== "undefined");
      const [upvotes, downvotes] = await Promise.all([
        contract.tokenToUpvotesMap(tokenId),
        contract.tokenToDownvotesMap(tokenId),
      ]);

      return [upvotes.toNumber(), downvotes.toNumber()];
    },
  });
}

export function useUserDidVote(
  userAddress: string | undefined,
  tokenId: number | undefined
): UseQueryResult<[didUpvote: boolean, didDownvote: boolean]> {
  const contract = useContractV1();

  return useQuery({
    queryKey: ["user-votes", tokenId, userAddress],
    enabled:
      !!contract &&
      typeof tokenId !== "undefined" &&
      userAddress !== "undefined",
    queryFn: async () => {
      invariant(contract);
      invariant(typeof tokenId !== "undefined");
      invariant(typeof userAddress !== "undefined");

      const [didUpvote, didDownvote] = await Promise.all([
        contract.tokenToUpvoterAddressMap(tokenId, userAddress),
        contract.tokenToDownvoterAddressMap(tokenId, userAddress),
      ]);

      return [didUpvote, didDownvote];
    },
  });
}

export function useUpvote(): UseMutationResult<
  unknown,
  unknown,
  { tokenId: number }
> {
  const queryClient = useQueryClient();
  const contract = useContractV1();
  return useMutation(
    async ({ tokenId }) => {
      invariant(contract);
      const tx = await contract.upvoteToken(tokenId);
      const receipt = await tx.wait();
      if (!receipt.status) {
        throw new Error();
      }
    },
    {
      onSuccess: (_data, { tokenId }) => {
        return Promise.all([
          queryClient.invalidateQueries(`votes/${tokenId}`),
          queryClient.invalidateQueries(["user-votes", tokenId]),
        ]);
      },
    }
  );
}

export function useDownvote(): UseMutationResult<
  unknown,
  unknown,
  { tokenId: number }
> {
  const queryClient = useQueryClient();
  const contract = useContractV1();
  return useMutation(
    async ({ tokenId }) => {
      invariant(contract);
      const tx = await contract.downvoteToken(tokenId);
      const receipt = await tx.wait();
      if (!receipt.status) {
        throw new Error();
      }
    },
    {
      onSuccess: (_data, { tokenId }) => {
        return queryClient.invalidateQueries(`votes/${tokenId}`);
      },
    }
  );
}
