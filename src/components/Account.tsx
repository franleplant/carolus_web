export interface IProps {
  account?: string;
  firstChunkSize?: number;
  secondChunkSize?: number;
}

// TODO ENS
export default function Account(props: IProps) {
  if (!props.account) {
    return null;
  }

  return (
    <span title={props.account} className="text-xs">
      {shortenAddress(
        props.account,
        props.firstChunkSize,
        props.secondChunkSize
      )}
    </span>
  );
}

export function shortenAddress(
  address: string,
  firstChunkSize = 7,
  secondChunkSize = 7
): string {
  if (address.length >= firstChunkSize + secondChunkSize) {
    return address;
  }
  return `${address.slice(0, firstChunkSize)}...${address.slice(
    -secondChunkSize
  )}`;
}
