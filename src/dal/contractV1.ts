import { useMemo } from "react";
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

// TODO make this work without login to metamask
export function useContractV1(): CarolusNFTV1 | null {
  const contractAddress = process.env.REACT_APP_CAROLUS_V1_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("missing process.env.REACT_APP_NOT_SECRET_CODE");
  }
  const { account, library } = useWeb3Session();

  return useMemo(() => {
    if (!library) {
      return null;
    }

    try {
      let signerOrProvider: ethers.Signer | ethers.providers.Provider = library;
      if (account) {
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
  }, [account, contractAddress, library]);
}

export interface INewsItemContent {
  tokenId: number;
  content: string;
  tokenURI: string;
}
export interface INewsItemMeta {
  tokenId: number;
  author: string;
  date: Date;
}
export interface INewsItem extends INewsItemContent, INewsItemMeta {
  /** the ERC271Enumerable index */
  index: number;
}

export async function getNewsItemContent(
  tokenId: number,
  contract: CarolusNFTV1
): Promise<INewsItemContent> {
  const [content, tokenURI] = await Promise.all([
    contract.contentMap(tokenId),
    contract.tokenURI(tokenId),
    contract.tokenToDownvotesMap(tokenId),
  ]);

  return { tokenId, content, tokenURI };
}

export async function getNewsItemMeta(
  tokenId: number,
  contract: CarolusNFTV1
): Promise<INewsItemMeta> {
  // get the token creation event
  const filter = contract.filters.Transfer(
    "0x0000000000000000000000000000000000000000",
    null,
    tokenId
  );
  //contract.on(filter, (from, to, tokenId) => {
  //console.log("got a new pub", from, to, tokenId);
  //});
  const events = await contract.queryFilter(filter);
  invariant(events.length === 1, "token creation event not found");
  const event = events[0];

  const author = event.args.to;
  const block = await event.getBlock();
  const date = new Date(block.timestamp * 1000);

  return { tokenId, author, date };
}

export async function getNewsItem(
  index: number,
  contract: CarolusNFTV1
): Promise<INewsItem> {
  const tokenId = await contract.tokenByIndex(index);
  const [content, meta] = await Promise.all([
    getNewsItemContent(tokenId.toNumber(), contract),
    getNewsItemMeta(tokenId.toNumber(), contract),
  ]);
  return { ...content, ...meta, index };
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
