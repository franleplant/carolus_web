import { useNewsItem } from "dal/contractV1";
import { Routes, Route, useParams } from "react-router-dom";
import invariant from "ts-invariant";

export default function NewsItem() {
  const params = useParams();
  const tokenIndex = params.tokenIndex;
  invariant(tokenIndex);

  const { data: newsItem } = useNewsItem(Number(tokenIndex));

  return <p>{JSON.stringify(newsItem)}</p>;
}
