import { always } from "kremling";
import { ReactNode, useContext } from "react";
import { PageLayoutContext } from "../App";
import { secondaryNavContentLeft } from "./SecondaryNav";

export function MainContent(props: Props) {
  const mainContentMaxWidth = 657;
  const pageLayout = useContext(PageLayoutContext);

  return (
    <main
      className={`mt-28 lg:mt-14 ml-0 lg:ml-${secondaryNavContentLeft(
        pageLayout.secondaryNav.collapsed
      )}`}
    >
      <div
        className={always("w-full pt-4")
          .maybe("mx-auto", !props.leftAlign)
          .maybe("p-4", props.padding)}
        style={{ maxWidth: mainContentMaxWidth }}
      >
        {props.children}
      </div>
    </main>
  );
}

interface Props {
  children: ReactNode;
  leftAlign?: boolean;
  padding?: boolean;
}
