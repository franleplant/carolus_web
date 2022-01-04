import { useMemo } from "react";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { range, keyBy } from "lodash";
import { useQuery, useQueryClient, UseQueryResult } from "react-query";

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

// TODO unify with the below
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
  const start = supply - pageSize * page;
  const end = supply - pageSize * (page + 1);
  return range(Math.max(start, 0), Math.max(end, -1), -1);
}

//export async function getNews({
//contract,
//page = 2,
//pageSize = 10,
//}: {
//contract: CarolusNFTV1;
//page?: number;
//pageSize?: number;
//}): Promise<Array<INewsItem>> {
//const lastToken = (await contract.totalSupply()).toNumber();
//// TODO move this logic into it's own fn
//// TODO make the totalSupply available to the UI so we can show max pages
//const start = lastToken - pageSize * page;
//const end = lastToken - pageSize * (page + 1);
//const pageItems = range(Math.max(start, 0), Math.max(end, -1), -1);
//console.log(start, end, pageItems);
//const news = await Promise.all(
//range(lastToken).map(async (index) => {
//const tokenId = await contract.tokenByIndex(index);
//const [content, meta] = await Promise.all([
//getNewsItemContent(tokenId.toNumber(), contract),
//getNewsItemMeta(tokenId.toNumber(), contract),
//]);
//return { ...content, ...meta, index };
//})
//);

//return news;
//}

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

// TODO be able to show news without loging in
//export function useNews(): UseQueryResult<Array<INewsItem>> {
//const contract = useContractV1();

//return useQuery({
//queryKey: "news",
//enabled: !!contract,
//queryFn: async () => {
//// TODO invariant
//if (!contract) {
//throw new Error();
//}
//return getNews({ contract });
//},
//});
//}

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

export function useNewsForceUpdate(): () => void {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries("news_supply");
}
