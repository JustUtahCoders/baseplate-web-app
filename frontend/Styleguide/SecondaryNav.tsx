import {
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { NavOrientation, PageLayoutContext } from "../App";
import { useBrowserDimensions } from "../Utils/browserHelpers";
import { Anchor } from "./Anchor";
import { Button, ButtonKind } from "./Button";
import "./SecondaryNav.css";

export function SecondaryNav(props: SecondaryNavProps) {
  const pageLayout = useContext(PageLayoutContext);
  const [collapsed, setCollapsed] = useState(false);
  const width = secondaryNavContentLeft(collapsed);
  const dimensions = useBrowserDimensions();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const orientation = dimensions.isLg
      ? NavOrientation.vertical
      : NavOrientation.horizontal;
    pageLayout.setSecondaryNav({
      present: true,
      collapsed,
      orientation,
    });

    return () => {
      pageLayout.setSecondaryNav({
        collapsed: false,
        orientation,
        present: false,
      });
    };
  }, [width, dimensions]);

  return (
    <nav
      className={`fixed w-full lg:w-${width} bg-slate-300 lg:border lg:border-r h-14 secondary-nav-height top-14`}
    >
      <ul className="flex justify-between flex-col h-full hidden lg:block">
        <div>{props.children}</div>
        <li className={secondaryNavRowClasses()}>
          <Button
            kind={ButtonKind.transparent}
            onClick={() => setCollapsed(!collapsed)}
            className={secondaryNavClickableClasses()}
          >
            Collapse
          </Button>
        </li>
      </ul>
      <ul className="flex justify-end lg:hidden">
        <Button
          kind={ButtonKind.transparent}
          onClick={() => setModalOpen(!modalOpen)}
        >
          Hamburger
        </Button>
      </ul>
      <ul
        className={`fixed top-0 w-10/12 h-full bg-slate-400 z-10 transition-transform ${
          modalOpen ? "" : "-translate-x-full"
        }`}
      >
        {props.children}
      </ul>
    </nav>
  );
}

export function SecondaryNavSection(props: SecondaryNavSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const caret = collapsed ? "\u203A" : "\u2304";

  return (
    <>
      <li className={secondaryNavRowClasses()}>
        <Button
          kind={ButtonKind.transparent}
          onClick={() => setCollapsed(!collapsed)}
          className={secondaryNavClickableClasses()}
        >
          {caret} {props.text}
        </Button>
      </li>
      {!collapsed && props.children}
    </>
  );
}

export function SecondaryNavLink(props: SecondaryNavLinkProps) {
  return (
    <li className={secondaryNavRowClasses()}>
      <Anchor
        kind={ButtonKind.transparent}
        to={props.to}
        className={secondaryNavClickableClasses()}
      >
        {props.children}
      </Anchor>
    </li>
  );
}

export function secondaryNavContentLeft(collapsed: boolean): number {
  return collapsed ? 14 : 40;
}

function secondaryNavRowClasses(): string {
  return `border-b border text-left`;
}

function secondaryNavClickableClasses(): string {
  return `w-full py-6 text-left`;
}

interface SecondaryNavProps {
  children: ReactNode;
}

interface SecondaryNavSectionProps {
  text: string;
  children: ReactNode;
}

interface SecondaryNavLinkProps {
  children: ReactNode;
  to: string;
}
