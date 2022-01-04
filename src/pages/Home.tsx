import { useState } from "react";

import List from "@mui/material/List";

import { useNewsSupply, calcPaging } from "dal/contractV1";

import NewsItemSummary from "components/NewsItemSummary";

export default function Home() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { isLoading, data } = useNewsSupply();
  const supply = data?.supply || 0;

  const pageItems = isLoading ? [] : calcPaging(supply, page, pageSize);
  const maxPages = Math.floor(supply / pageSize);

  console.log(pageItems);
  console.log(maxPages, supply);

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div>
            <span>Total {supply}</span>
            <span>Page {page}</span>
            <button
              onClick={() => setPage((page) => Math.min(page + 1, maxPages))}
            >
              next
            </button>
            <button onClick={() => setPage((page) => Math.max(page - 1, 0))}>
              previous
            </button>
          </div>
          <List>
            {pageItems.map((index) => {
              return <NewsItemSummary key={index} index={index} />;
            })}
          </List>
        </div>
      )}
    </>
  );
}
