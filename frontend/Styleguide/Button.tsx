import { always, maybe } from "kremling";
import { ButtonHTMLAttributes, forwardRef } from "react";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      kind,
      className,
      buttonSize = ButtonSize.large,
      children,
      disabled = false,
      ...otherProps
    } = props;

    return (
      <button
        className={buttonClasses(kind, buttonSize, className, disabled)}
        {...otherProps}
        ref={ref}
      >
        {children}
      </button>
    );
  }
);

export enum ButtonSize {
  medium = "md",
  large = "lg",
  small = "sm",
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind: ButtonKind;
  buttonSize?: ButtonSize;
}

export enum ButtonKind {
  primary = "primary",
  secondary = "secondary",
  transparent = "transparent",
  classic = "classic",
  icon = "icon",
}

export function buttonClasses(
  kind: ButtonKind,
  size: ButtonSize,
  extraClassName: string = "",
  disabled?: boolean
) {
  const kindClasses = buttonKindClasses[kind] || "";
  const isStyled = styledButtonKinds.includes(kind);

  return always(kindClasses)
    .always(extraClassName)
    .maybe(styledButtonClasses, isStyled)
    .maybe("py-2.5 px-5", isStyled && size === ButtonSize.large)
    .maybe("py-1 px-2 text-sm", isStyled && size === ButtonSize.medium)
    .maybe("py-.5 px-1 text-xs", isStyled && size === ButtonSize.small)
    .maybe("bg-gray-300 cursor-not-allowed", disabled)
    .toString();
}

const styledButtonClasses = `inline-flex items-center justify-center cursor-pointer rounded font-medium`;

const styledButtonKinds = [ButtonKind.primary, ButtonKind.secondary];

const buttonKindClasses = {
  [ButtonKind.primary]: "bg-primary text-white",
  [ButtonKind.secondary]:
    "text-gray-500 border-gray-500 border hover:bg-gray-200",
  [ButtonKind.transparent]: "no-underline hover:no-underline",
  [ButtonKind.classic]:
    "text-link underline hover:text-primary hover:underline",
  [ButtonKind.icon]:
    "text-link hover:bg-gray-200 inline-flex justify-items-center align-items-center p-2 rounded",
};
