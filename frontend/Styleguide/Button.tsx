import { always, maybe } from "kremling";
import { ButtonHTMLAttributes, forwardRef } from "react";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { kind, className, children, ...otherProps } = props;

    return (
      <button
        className={buttonClasses(kind, className)}
        {...otherProps}
        ref={ref}
      >
        {children}
      </button>
    );
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind: ButtonKind;
}

export enum ButtonKind {
  primary = "primary",
  secondary = "secondary",
  transparent = "transparent",
  classic = "classic",
  icon = "icon",
}

export function buttonClasses(kind: ButtonKind, extraClassName: string = "") {
  const kindClasses = buttonKindClasses[kind] || "";
  const ubiquitousClasses = `inline-block`;

  return always(kindClasses)
    .always(extraClassName)
    .always(ubiquitousClasses)
    .maybe(styledButtonClasses, styledButtonKinds.includes(kind))
    .toString();
}

const styledButtonClasses = `inline-flex items-center justify-center cursor-pointer py-2.5 px-5 rounded font-medium`;

const styledButtonKinds = [ButtonKind.primary, ButtonKind.secondary];

const buttonKindClasses = {
  [ButtonKind.primary]: "bg-primary text-white",
  [ButtonKind.secondary]:
    "text-gray-500 border-gray-500 border hover:text-gray-500",
  [ButtonKind.transparent]: "text-primary hover:text-primary",
  [ButtonKind.classic]:
    "text-primary underline hover:text-primary hover:underline",
  [ButtonKind.icon]:
    "text-primary hover:bg-gray-200 inline-flex justify-items-center align-items-center p-2 rounded",
};
