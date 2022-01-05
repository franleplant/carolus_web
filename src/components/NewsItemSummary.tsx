import { useNavigate } from "react-router-dom";
import moment from "moment";

import { useNewsItem } from "dal/contractV1";
import Account from "components/Account";
import React from "react";

export interface IProps {
  /** token index */
  index: number;
}

export default function NewsItemSummary(props: IProps) {
  const navigate = useNavigate();
  const { isLoading, data: news } = useNewsItem(props.index);

  return (
    <div
      onClick={() => navigate(`/news/${props.index}`)}
      className="flex flex-col max-w-sm p-4 rounded cursor-pointer w-96 hover:drop-shadow-lg bg-paper_bg"
    >
      {!!news ? (
        <Content content={news.content} author={news.author} date={news.date} />
      ) : (
        <p>Loading..</p>
      )}
    </div>
  );
}

const MAX_CONTENT_LEN = 40;

export function truncateText(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max)}...`;
}

export function Content({
  content,
  author,
  date,
}: {
  content: string;
  author: string;
  date: Date;
}) {
  const lines = content.trim().split("\n");
  const [title, ...body] = lines;

  const bodyText = truncateText(body.join("\n").trim(), MAX_CONTENT_LEN);

  return (
    <>
      <h3 className="">{title.charAt(0).toUpperCase() + title.slice(1)}</h3>
      <pre className="mb-4">{bodyText}</pre>
      <div className="mt-auto">
        <p className="text-xs">
          by <Account account={author} firstChunkSize={Infinity} />
        </p>
        <p className="text-xs">{`${moment(date).format("YYYY-MM-DD")}`}</p>
      </div>
    </>
  );
}

export function HyperCased({ text, as }: { text: string; as: string }) {
  if (text.length <= 1) {
    return React.createElement(as, {}, [text]);
  }
  //const first = text[0]
  const [first, ...rest] = text.split("");

  const hyper = (
    <span className="text-6xl" key="first">
      {first.toUpperCase()}
    </span>
  );

  return React.createElement(as, {}, [hyper, rest]);
}
