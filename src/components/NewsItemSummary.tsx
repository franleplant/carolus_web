import { useNavigate } from "react-router-dom";
import moment from "moment";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";

import { useNewsItem } from "dal/contractV1";

export interface IProps {
  /** token index */
  index: number;
}

export default function NewsItemSummary(props: IProps) {
  const navigate = useNavigate();
  const { isLoading, data: news } = useNewsItem(props.index);

  return (
    <ListItem
      secondaryAction={
        <>
          <IconButton edge="end">⬆️</IconButton>
          <IconButton edge="end">⬇️</IconButton>
        </>
      }
    >
      <ListItemButton onClick={() => navigate(`/news/${props.index}`)}>
        {!!news ? (
          <ListItemText
            primary={`${news.content.split("\n")?.[0]}...`}
            secondary={`by ${news.author} on ${moment(news.date).format(
              "HH:mm YYYY-MM-DD"
            )}`}
          />
        ) : (
          <p>Loading..</p>
        )}
      </ListItemButton>
    </ListItem>
  );
}
