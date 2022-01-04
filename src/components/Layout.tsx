import { Outlet } from "react-router-dom";
import Header from "components/Header";

export interface IProps {}

export default function Layout(props: IProps) {
  return (
    <div className="App">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
