import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useNewsSupply, calcPaging } from "dal/contractV1";

import NewsItemSummary from "components/NewsItemSummary";
import Pagination from "components/Pagination";

export default function Home() {
  const navigate = useNavigate();
  const params = useParams();
  const page = Number(params.page || 0);
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const [pageSize, setPageSize] = useState(20);

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
          <Pagination
            total={supply}
            page={page}
            maxPages={maxPages}
            onNextPage={onNextPage}
            onPrevPage={onPrevPage}
          />
          <div className="flex flex-wrap items-stretch justify-center mt-4 overflow-hidden gap-2">
            {pageItems.map((index) => {
              return <NewsItemSummary key={index} index={index} />;
            })}
          </div>
        </div>
      )}
    </>
  );
}
