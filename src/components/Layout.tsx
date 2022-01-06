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
        {isHome && <Title />}
        <Outlet />
      </main>
    </div>
  );
}

export function Title() {
  return (
    <>
      <h1 className="pb-0 text-center">Carolus</h1>
      <p className="pb-8 italic text-center text-gray-600">
        A decentralized online newspaper
      </p>
    </>
  );
}
