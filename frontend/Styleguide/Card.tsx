import { always, maybe } from "kremling";
import { forwardRef, HTMLProps, ReactNode, Ref } from "react";

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  props,
  ref
) {
  const {
    className,
    contentPadding = true,
    footer,
    children,
    header,
    contentProps,
    ...otherProps
  } = props;
  const { className: contentClassName, ...otherContentProps } =
    contentProps || {};

  return (
    <div
      ref={ref}
      className={always(className as string)
        .always("border border-gray-300 rounded bg-white")
        .toggle("pt-1.5", "py-1.5", footer || !contentPadding)
        .toString()}
      {...otherProps}
    >
      {header}
      <div
        className={maybe("px-3.5", contentPadding).always(
          contentClassName as string
        )}
        {...otherContentProps}
      >
        {children}
      </div>
      {footer}
    </div>
  );
});

export interface CardProps extends HTMLProps<HTMLDivElement> {
  footer?: ReactNode;
  header?: ReactNode;
  contentProps?: HTMLProps<HTMLDivElement>;
  contentPadding?: boolean;
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

export function CardHeader(props: CardHeaderProps) {
  const { className, contentPadding = true, children, ...otherProps } = props;

  return (
    <div
      className={always(className as string)
        .always("border-b border-gray-300 pb-4 pt-2.5 px-3.5")
        .maybe("mb-1.5", contentPadding)
        .toString()}
      {...otherProps}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends HTMLProps<HTMLDivElement> {
  contentPadding?: boolean;
}
