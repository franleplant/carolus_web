import React from "react";

export interface IProps {
  account?: string;
  as?: string;
  firstChunkSize?: number;
  secondChunkSize?: number;
  className?: string;
}

// TODO ENS
export default function Account(props: IProps) {
  const { account, firstChunkSize, secondChunkSize, ...rest } = props;
  if (!account) {
    return null;
  }

  return React.createElement(
    props.as || "span",
    { className: "text-xs", title: account, ...rest },
    [shortenAddress(account, firstChunkSize, secondChunkSize)]
  );
}

export function shortenAddress(
  address: string,
  firstChunkSize = 7,
  secondChunkSize = 7
): string {
  if (firstChunkSize + secondChunkSize >= address.length) {
    return address;
  }
  return `${address.slice(0, firstChunkSize)}...${address.slice(
    -secondChunkSize
  )}`;
}
