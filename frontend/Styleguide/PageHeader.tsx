import { ReactNode } from "react";
import { Anchor } from "../Styleguide/Anchor";
import { ButtonKind } from "../Styleguide/Button";

export function PageHeader(props: PageHeaderProps) {
  return (
    <div className="flex align-center">
      <h1 className="text-2xl mb-2">{props.children}</h1>
      {props.badgeText && (
        <div
          style={{ maxHeight: "26px", marginTop: "4px" }}
          className="ml-4 uppercase text-sm tracking-widest rounded bg-gray-200 text-gray-700 py-1 px-2"
        >
          {props.badgeText}
        </div>
      )}
    </div>
  );
}

export interface PageHeaderProps {
  children: ReactNode;
  badgeText?: string;
}

export function PageExplanation(props: PageExplanationProps) {
  return (
    <p className="mb-8 text-sm text-gray-700">
      {props.briefExplanation}{" "}
      <Anchor kind={ButtonKind.classic} to={props.docsLink}>
        Documentation
      </Anchor>
    </p>
  );
}

export interface PageExplanationProps {
  briefExplanation: ReactNode;
  docsLink: string;
}
