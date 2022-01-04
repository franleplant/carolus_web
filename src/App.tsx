import { useState } from "react";
import { ethers } from "ethers";
import moment from "moment";
import "./App.css";
import Button from "@mui/material/Button";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import { useWeb3Session } from "hooks/web3";
import Header from "components/Header";
import Composer from "components/Composer";
import { useContractV1, useNews, useNewsForceUpdate } from "dal/contractV1";

export default function App() {
  const { active, account } = useWeb3Session();
  const [open, setOpen] = useState(false);
  const contract = useContractV1();

  const { data: news = [], isLoading } = useNews();
  const forceUpdateNews = useNewsForceUpdate();

  async function onPublish(content: string) {
    if (!contract) {
      throw new Error("contract is undef");
    }

    try {
      const tx = await contract.publishMint(content, {
        value: ethers.constants.WeiPerEther.div(2),
      });
      const receipt = await tx.wait();
      if (!receipt.status) {
        throw new Error();
      }
      setOpen(false);
      forceUpdateNews();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="App">
      <Header onWrite={() => setOpen(true)} />
      <Composer
        open={open}
        onClose={() => setOpen(false)}
        onPublish={onPublish}
      />
      <main>
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
      </main>
    </div>
  );
}
