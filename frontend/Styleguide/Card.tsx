import { always } from "kremling";
import { HTMLProps, ReactNode } from "react";

export function Card(props: CardProps) {
  const { className, footer, children, ...otherProps } = props;

  return (
    <div
      className={always(className as string)
        .always("border border-gray-300 rounded bg-white")
        .toggle("pt-1.5", "py-1.5", footer)
        .toString()}
      {...otherProps}
    >
      <div className="px-3.5">{children}</div>
      {footer}
    </div>
  );
}

export interface CardProps extends HTMLProps<HTMLDivElement> {
  footer?: ReactNode;
}

export function CardFooter(props: CardFooterProps) {
  const { className, children, ...otherProps } = props;

  return (
    <div
      className={always(className as string)
        .always("border-t border-gray-300 mt-1.5 py-1.5 px-3.5")
        .toString()}
      {...otherProps}
    >
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLProps<HTMLDivElement> {}
