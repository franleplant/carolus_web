import { useMemo } from "react";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { range, keyBy } from "lodash";
import { useQuery, useQueryClient, UseQueryResult } from "react-query";

import CarolusNFTV1Artifact from "abi/CarolusNFTV1.json";
import type { CarolusNFTV1 } from "typechain/CarolusNFTV1.d";
import { useWeb3Session } from "hooks/web3";

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
export interface INewsItem extends INewsItemContent, INewsItemMeta {}

export async function getNewsItemContent(
  index: number,
  contract: CarolusNFTV1
): Promise<INewsItemContent> {
  const tokenId = await contract.tokenByIndex(index);

  const [content, tokenURI] = await Promise.all([
    contract.contentMap(tokenId),
    contract.tokenURI(tokenId),
  ]);

  return { tokenId: tokenId.toNumber(), content, tokenURI };
}

export async function getNewsMeta(
  contract: CarolusNFTV1
): Promise<Array<INewsItemMeta>> {
  // get all token creation events
  const filter = contract.filters.Transfer(
    "0x0000000000000000000000000000000000000000"
  );
  //contract.on(filter, (from, to, tokenId) => {
  //console.log("got a new pub", from, to, tokenId);
  //});
  const events = await contract.queryFilter(filter);
  //console.log("events", events);

  return Promise.all(
    events.map(async (event) => {
      const tokenId = event.args.tokenId;
      const author = event.args.to;
      const block = await event.getBlock();
      const date = new Date(block.timestamp * 1000);

      return { tokenId: tokenId.toNumber(), author, date };
    })
  );
}

export async function getNews(
  contract: CarolusNFTV1
): Promise<Array<INewsItem>> {
  const lastToken = await contract.totalSupply();
  const newsContentPromise = Promise.all(
    range(lastToken.toNumber()).map((index) =>
      getNewsItemContent(index, contract)
    )
  );

  const newsMetaPromise = getNewsMeta(contract);

  const [content, meta] = await Promise.all([
    newsContentPromise,
    newsMetaPromise,
  ]);
  const metaMap = keyBy(meta, "tokenId");

  return content.map((item) => {
    return {
      ...item,
      ...metaMap[item.tokenId],
    };
  });
}

// TODO be able to show news without loging in
export function useNews(): UseQueryResult<Array<INewsItem>> {
  const contract = useContractV1();

  return useQuery({
    queryKey: "news",
    enabled: !!contract,
    queryFn: async () => {
      // TODO invariant
      if (!contract) {
        throw new Error();
      }
      return getNews(contract);
    },
  });
}

export function useNewsForceUpdate(): () => void {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries("news");
}
