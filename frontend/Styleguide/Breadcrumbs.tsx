import { Fragment } from "react";
import { Anchor } from "./Anchor";
import { ButtonKind } from "./Button";

export function Breadcrumbs(props: BreadcrumbsProps) {
  return (
    <div className="mb-4">
      {props.crumbs.map((crumb, i) => (
        <Fragment key={i}>
          <Anchor
            kind={ButtonKind.classic}
            to={crumb.href}
            className="no-underline hover:no-underline"
          >
            {i === 0 && <span className="mr-2">{"\u2190"}</span>}
            <span className="underline">{crumb.label}</span>
          </Anchor>
          <span className="mx-2">/</span>
        </Fragment>
      ))}
      {props.currentPage}
    </div>
  );
}

export interface BreadcrumbsProps {
  crumbs: Breadcrumb[];
  currentPage: string;
}

export interface Breadcrumb {
  label: string;
  href: string;
}
