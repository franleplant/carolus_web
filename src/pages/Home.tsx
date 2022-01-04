import moment from "moment";
//import "./App.css";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import { useContractV1, useNews, useNewsForceUpdate } from "dal/contractV1";

export default function Home() {
  const { data: news = [], isLoading } = useNews();

  return (
    <>
      {isLoading && <p>Loading...</p>}
      <List>
        {[...news].reverse().map((news) => {
          return (
            <ListItem key={news.tokenId}>
              <ListItemButton>
                <ListItemText
                  primary={`${news.content.slice(0, 50)}`}
                  secondary={`by ${news.author} on ${moment(news.date).format(
                    "HH:mm YYYY-MM-DD"
                  )}`}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}
