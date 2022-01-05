import { Outlet, useLocation } from "react-router-dom";
import Header from "components/Header";

export interface IProps {}

export default function Layout(props: IProps) {
  const location = useLocation();
  const isHome =
    location.pathname === "/" || location.pathname.includes("list");

  return (
    <div className="overflow-hidden">
      <Header />
      <main className="">
        {isHome && <h1 className="text-center">Carolus</h1>}
        <Outlet />
      </main>
    </div>
  );
}
