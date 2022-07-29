import { always } from "kremling";
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
import { Icon, IconVariant } from "./Icon";
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
  }, [width, dimensions, collapsed, pageLayout]);

  return (
    <nav
      className={always(
        `fixed w-full lg:w-${width} lg:border-r lg:border-t-0 border-gray-400 h-14 secondary-nav-height border-t-0 top-14`
      ).maybe("collapsed", collapsed)}
    >
      <ul className="justify-between flex-col h-full hidden lg:flex">
        <div>{props.children}</div>
        <li
          className={always(secondaryNavRowClasses()).always(
            "border-t border-b-0 border-gray-400"
          )}
        >
          <Button
            kind={ButtonKind.transparent}
            onClick={() => setCollapsed(!collapsed)}
            className={secondaryNavClickableClasses()}
          >
            {collapsed ? (
              <Icon variant={IconVariant.collapsed} />
            ) : (
              <>
                <Icon variant={IconVariant.expanded} />
                Collapse
              </>
            )}
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
        {props.icon && <Icon variant={props.icon} />}
        <div className="collapsible ml-2">{props.children}</div>
      </Anchor>
    </li>
  );
}

export function secondaryNavContentLeft(collapsed: boolean): number {
  return collapsed ? 14 : 40;
}

function secondaryNavRowClasses(): string {
  return `border-b border-gray-600 text-left secondary-nav-row h-12 flex items-center justify-center`;
}

function secondaryNavClickableClasses(): string {
  return `w-full text-left inline-flex items-center justify-start secondary-nav-clickable h-full`;
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
  icon?: IconVariant;
}
