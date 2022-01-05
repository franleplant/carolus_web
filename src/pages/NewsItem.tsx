import moment from "moment";
import { useNewsItem } from "dal/contractV1";
import { useParams } from "react-router-dom";
import invariant from "ts-invariant";

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

  const date = moment(newsItem.date).format("HH:mm YYYY-MM-DD");

  return (
    <div>
      <pre>{newsItem.content}</pre>
      <p>
        by {newsItem.author} on {date}
      </p>
      <p>tokenId {newsItem.tokenId}</p>
      <p>tokenIndex {newsItem.index}</p>
      <p>URI {newsItem.tokenURI}</p>
    </div>
  );
}
