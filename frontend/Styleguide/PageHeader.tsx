import { ReactNode } from "react";
import { Anchor } from "../Styleguide/Anchor";
import { ButtonKind } from "../Styleguide/Button";

export function PageHeader(props: PageHeaderProps) {
  return <h1 className="text-xl mb-2">{props.children}</h1>;
}

export interface PageHeaderProps {
  children: ReactNode;
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
  briefExplanation: string;
  docsLink: string;
}
