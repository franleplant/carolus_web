import moment from "moment";
import {
  INewsItem,
  useNewsItem,
  useVotes,
  useUpvote,
  useDownvote,
  useUserDidVote,
} from "dal/contractV1";
import { useParams } from "react-router-dom";
import invariant from "ts-invariant";
import { truncateText } from "components/NewsItemSummary";
import Account from "components/Account";
import Button from "components/Button";
import { useWeb3Session } from "hooks/web3";

export default function NewsItem() {
  const params = useParams();
  const tokenIndex = params.tokenIndex;
  invariant(tokenIndex);

  const { isLoading, data: newsItem } = useNewsItem(Number(tokenIndex));
  const { data: votes } = useVotes(newsItem?.tokenId);
  const { mutateAsync: upvote } = useUpvote();
  const { mutateAsync: downvote } = useDownvote();

  const { account } = useWeb3Session();
  const { data: userVotes = [false, false] } = useUserDidVote(
    account || undefined,
    newsItem?.tokenId
  );

  async function onUpvote() {
    invariant(newsItem);
    await upvote({ tokenId: newsItem.tokenId });
  }
  async function onDownvote() {
    invariant(newsItem);
    await downvote({ tokenId: newsItem.tokenId });
  }

  if (isLoading || !newsItem) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 flex flex-col md:w-[60rem] p-4 mx-auto">
      <Content
        news={newsItem}
        votes={votes}
        onUpvote={onUpvote}
        onDownvote={onDownvote}
        userVotes={userVotes}
      />
    </div>
  );
}

export function Content(props: {
  news: INewsItem;
  onUpvote: () => Promise<void>;
  onDownvote: () => Promise<void>;
  votes?: [upvotes: number, downvotes: number];
  userVotes: [didUpvote: boolean, didDownvote: boolean];
}) {
  const [didUpvote, didDownvote] = props.userVotes;
  const { content, author, date, tokenId, index, tokenURI } = props.news;
  const lines = content.trim().split("\n");

  const [title, ...body] = lines;

  const bodyText = body.join("\n").trim();

  return (
    <>
      <h2 className="">{title.charAt(0).toUpperCase() + title.slice(1)}</h2>
      {/*
      <div className="flex flex-row items-center overflow-hidden gap-4">
      </div>
        */}
      <div className="flex flex-row flex-wrap items-baseline py-2 border-b gap-x-4 gap-y-1 border-y border-y-paper_fg">
        <p className="text-xs leading-6">
          by{" "}
          <Account
            account={author}
            firstChunkSize={Infinity}
            secondChunkSize={10}
          />
        </p>
        <div className="flex flex-row gap-1">
          <Button
            onClick={props.onUpvote}
            className={didUpvote ? "bg-gray-300" : ""}
            disabled={didDownvote}
          >
            Upvote
          </Button>
          <Button
            onClick={props.onDownvote}
            className={didDownvote ? "bg-gray-300" : ""}
            disabled={didUpvote}
          >
            Downvote
          </Button>
        </div>
        <p className="text-xs leading-6">{`${
          props.votes?.[0] ?? "?"
        } upvotes`}</p>
        <p className="text-xs leading-6">{`${
          props.votes?.[1] ?? "?"
        } downvotes`}</p>
        <p className="text-xs leading-6">
          published on {`${moment(date).format("YYYY-MM-DD")}`}
        </p>
      </div>
      <pre className="flex-1 px-2 my-6 overflow-hidden whitespace-normal">
        {bodyText}
      </pre>
      <div className="flex flex-row flex-wrap border-t gap-2 border-t-gray-300">
        {[`tokenId ${tokenId}`, `tokenIndex ${index}`, `${tokenURI}`].map(
          (tag, index) => (
            <span key={index} className="px-2 py-2 text-sm">
              {tag}
            </span>
          )
        )}
      </div>
    </>
  );
}
