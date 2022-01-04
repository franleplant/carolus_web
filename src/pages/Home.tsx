import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import List from "@mui/material/List";

import { useNewsSupply, calcPaging } from "dal/contractV1";

import NewsItemSummary from "components/NewsItemSummary";

export default function Home() {
  const navigate = useNavigate();
  const params = useParams();
  const page = Number(params.page || 0);
  //const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { isLoading, data } = useNewsSupply();
  const supply = data?.supply || 0;

  const pageItems = isLoading ? [] : calcPaging(supply, page, pageSize);
  const maxPages = Math.floor(supply / pageSize);

  function onNextPage() {
    const nextPage = Math.min(page + 1, maxPages);
    navigate(`/list/${nextPage}`);
  }

  function onPrevPage() {
    const prevPage = Math.max(page - 1, 0);
    navigate(`/list/${prevPage}`);
  }

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div>
            <span>Total {supply}</span>
            <span>Page {page}</span>
            <button onClick={onNextPage}>next</button>
            <button onClick={onPrevPage}>previous</button>
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
