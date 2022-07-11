import { Link, LinkProps } from "react-router-dom";
import { buttonClasses, ButtonKind, ButtonSize } from "./Button";

export function Anchor(props: AnchorProps) {
  const {
    kind,
    className,
    buttonSize = ButtonSize.large,
    children,
    to,
    ...otherProps
  } = props;

  // Use react-router (no page reload) when "to" prop is passed
  // Use <a> (with page reload) when "href" prop is passed
  const useReactRouter = !Boolean(props.href);

  if (useReactRouter) {
    const to: string = props.to as string;

    return (
      <Link
        to={to}
        className={buttonClasses(kind, buttonSize, className)}
        {...otherProps}
      >
        {children}
      </Link>
    );
  } else {
    return (
      <a className={buttonClasses(kind, buttonSize, className)} {...otherProps}>
        {children}
      </a>
    );
  }
}

export type AnchorProps = Omit<LinkProps, "to"> & {
  kind: ButtonKind;
  buttonSize?: ButtonSize;
  to?: string;
  href?: string;
};
