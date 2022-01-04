import { BrowserRouter, Routes, Route } from "react-router-dom";

import Providers from "components/Provider";
import Home from "pages/Home";
import Composer from "pages/Composer";
import Layout from "components/Layout";
import NewsItem from 'pages/NewsItem'

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="news/:tokenIndex" element={<NewsItem />} />
            <Route path="compose" element={<Composer />} />
            {/*
          <Route path="teams" element={<Teams />}>
            <Route path=":teamId" element={<Team />} />
            <Route path="new" element={<NewTeamForm />} />
            <Route index element={<LeagueStandings />} />
          </Route>
            */}
          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}
