import { Outlet, useLocation } from "react-router-dom";
import Header from "components/Header";

export interface IProps {}

export default function Layout(props: IProps) {
  const location = useLocation();
  const isHome =
    location.pathname === "/" || location.pathname.includes("list");

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      <Header />
      <main className="flex flex-col flex-1">
        {isHome && <h1 className="text-center">Carolus</h1>}
        <Outlet />
      </main>
    </div>
  );
}
