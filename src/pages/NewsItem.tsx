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

  if (isLoading || !newsItem) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 flex flex-col md:w-[72rem] p-4 mx-auto mt-4">
      <Content {...newsItem} />
    </div>
  );
}

export function Content({
  content,
  author,
  date,
  tokenId,
  index,
  tokenURI,
}: INewsItem) {
  const lines = content.trim().split("\n");

  const [title, ...body] = lines;

  const bodyText = body.join("\n").trim();

  return (
    <>
      <div className="py-2 border-b border-b-gray">
        <p className="text-xs">{`${moment(date).format("YYYY-MM-DD")}`}</p>
        <p className="text-xs">
          by{" "}
          <Account account={author} firstChunkSize={10} secondChunkSize={10} />
        </p>
      </div>
      <h2 className="pt-0">{title.charAt(0).toUpperCase() + title.slice(1)}</h2>
      <pre className="flex-1 px-2 my-6 overflow-hidden whitespace-normal">
        {bodyText}
      </pre>
      <div className="flex flex-row flex-wrap border-t gap-2 border-t-gray">
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
