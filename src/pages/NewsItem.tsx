import moment from "moment";
import { INewsItem, useNewsItem } from "dal/contractV1";
import { useParams } from "react-router-dom";
import invariant from "ts-invariant";
import { truncateText } from "components/NewsItemSummary";
import Account from "components/Account";

// TODO up and down votes news contract state
// TODO up and down vote news event
export default function NewsItem() {
  const params = useParams();
  const tokenIndex = params.tokenIndex;
  invariant(tokenIndex);

  const { isLoading, data: newsItem } = useNewsItem(Number(tokenIndex));

  async function onUpvote() {
    console.log("upvote");
  }
  async function onDownvote() {}

  if (isLoading || !newsItem) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 flex flex-col md:w-[60rem] p-4 mx-auto">
      <Content news={newsItem} onUpvote={onUpvote} onDownvote={onDownvote} />
    </div>
  );
}

export function Content(props: {
  news: INewsItem;
  onUpvote: () => Promise<void>;
  onDownvote: () => Promise<void>;
}) {
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
      <div className="flex flex-row flex-wrap py-2 border-b gap-x-4 gap-y-1 border-y border-y-paper_fg ">
        <div className="flex flex-row -ml-2">
          <button className="px-2 hover:bg-gray-300" onClick={props.onUpvote}>
            🔺
          </button>
          <button className="px-2 hover:bg-gray-300" onClick={props.onDownvote}>
            🔻
          </button>
        </div>
        <p className="text-xs leading-6">X votes</p>
        <p className="text-xs leading-6">
          published on {`${moment(date).format("YYYY-MM-DD")}`}
        </p>
        <p className="text-xs leading-6">
          by{" "}
          <Account
            account={author}
            firstChunkSize={Infinity}
            secondChunkSize={10}
          />
        </p>
      </div>
      <pre className="flex-1 px-2 my-6 overflow-hidden whitespace-normal">
        {bodyText}
      </pre>
      <div className="flex flex-row flex-wrap border-t gap-2 border-t-gray-300">
        {[
          `X votes`,
          `tokenId ${tokenId}`,
          `tokenIndex ${index}`,
          `${tokenURI}`,
        ].map((tag, index) => (
          <span key={index} className="px-2 py-2 text-sm">
            {tag}
          </span>
        ))}
      </div>
    </>
  );
}
