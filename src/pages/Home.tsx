//import "./App.css";

import List from "@mui/material/List";

import { useNewsSupply, calcPaging } from "dal/contractV1";

import NewsItemSummary from "components/NewsItemSummary";

export default function Home() {
  const { isLoading, data } = useNewsSupply();
  const supply = data?.supply || 0;

  const pageItems = isLoading ? [] : calcPaging(supply - 1);
  console.log(pageItems);

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <List>
          {pageItems.map((index) => {
            return <NewsItemSummary key={index} index={index} />;
          })}
        </List>
      )}
    </>
  );
}
