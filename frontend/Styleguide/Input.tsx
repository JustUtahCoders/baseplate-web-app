import { DetailedHTMLProps, forwardRef, InputHTMLAttributes } from "react";
import { always } from "kremling";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  props,
  ref
) {
  const { className, inputSize = "large", children, ...otherProps } = props;

  return (
    <input
      ref={ref}
      className={always(className as string)
        .always("border border-gray-300 rounded py-2.5 px-3.5")
        .toggle("py-2.5 px-3.5", "py-1 px-2", inputSize === "large")
        .toString()}
      {...otherProps}
    >
      {children}
    </input>
  );
});

export interface InputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  inputSize?: "medium" | "large";
}
