import invariant from "ts-invariant";
import { ethers } from "ethers";
import { range } from "lodash";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";

import type { CarolusNFTV1 } from "typechain/CarolusNFTV1.d";
import { useContractContext } from "components/Provider/Contract";

//export function usePrevious<T>(value: T): T | undefined {
//const valueRef = useRef(value)
//useEffect(() => {
//valueRef.current = value
//}, [value])

//return valueRef.current
//}

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
  const { contractV1: contract } = useContractContext();
  return useQuery({
    queryKey: "news_supply",
    enabled: !!contract,
    queryFn: async () => {
      invariant(contract, "contract is not defined");
      const supply = (await contract.totalSupply()).toNumber();
      return { supply };
    },
  });
}

export function useNewsItem(index: number): UseQueryResult<INewsItem> {
  const { contractV1: contract } = useContractContext();

  return useQuery({
    queryKey: ["news", index],
    enabled: !!contract,
    staleTime: Infinity,
    queryFn: async () => {
      invariant(contract, "contract is not defined");
      return getNewsItem(index, contract);
    },
  });
}

export function usePublishMint(): UseMutationResult<
  unknown,
  unknown,
  { content: string }
> {
  const { contractV1: contract } = useContractContext();
  const queryClient = useQueryClient();
  return useMutation(
    async ({ content }) => {
      invariant(contract, "contract is not defined");
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
  const { contractV1: contract } = useContractContext();

  return useQuery({
    queryKey: `votes/${tokenId}`,
    enabled: !!contract && typeof tokenId !== "undefined",
    queryFn: async () => {
      invariant(contract, "contract is not defined");
      invariant(typeof tokenId !== "undefined", "tokenId is undefined");
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
  const { contractV1: contract } = useContractContext();

  return useQuery({
    queryKey: ["user-votes", tokenId, userAddress],
    enabled: !!contract && !!userAddress && typeof tokenId !== "undefined",
    queryFn: async () => {
      invariant(contract, "contract is not defined");
      invariant(typeof tokenId !== "undefined", "token id is not defined");
      invariant(
        typeof userAddress !== "undefined",
        "user address is not defined"
      );

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
  const { contractV1: contract } = useContractContext();
  return useMutation(
    async ({ tokenId }) => {
      invariant(contract, "contract is not defined");
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
  const { contractV1: contract } = useContractContext();
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
