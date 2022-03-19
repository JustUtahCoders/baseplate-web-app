import ReachTooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";
import { ReactElement } from "react";

export function Tooltip(props: TooltipProps): ReactElement {
  return <ReachTooltip label={props.label}>{props.children}</ReachTooltip>;
}

interface TooltipProps {
  label: string;
  children: ReactElement | ReactElement[] | boolean | null;
}
