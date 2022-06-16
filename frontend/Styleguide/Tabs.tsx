import { always } from "kremling";
import { matchRoutes, useLocation, useMatch } from "react-router";
import { Anchor } from "./Anchor";
import { ButtonKind } from "./Button";

export function Tabs(props: TabsProps) {
  return (
    <div className="border-b border-gray-400 flex my-6">
      {props.items.map((item) => (
        <Tab key={item.href} item={item} />
      ))}
    </div>
  );
}

function Tab(props: TabItemProps) {
  const location = useLocation();
  const tabIsActive = Boolean(
    matchRoutes([{ path: props.item.href }], location.pathname)
  );

  return (
    <Anchor
      to={props.item.href}
      kind={ButtonKind.transparent}
      className={always("px-6 py-3 hover:bg-gray-200 block")
        .toggle("text-gray-800", "text-gray-600", tabIsActive)
        .maybe("border-b-2 border-primary", tabIsActive)}
    >
      {props.item.label}
    </Anchor>
  );
}

export interface TabItemProps {
  item: TabItem;
}

export interface TabsProps {
  items: TabItem[];
}

export interface TabItem {
  label: string;
  href: string;
}
