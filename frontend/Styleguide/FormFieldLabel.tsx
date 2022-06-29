import { HTMLProps } from "react";
import { always } from "kremling";

export function FormFieldLabel(props: FormFieldLabelProps) {
  const {
    className,
    children,
    orientation = "vertical",
    ...otherProps
  } = props;

  return (
    <label
      className={always(className as string)
        .always("text-gray-800 text-sm")
        .toggle("mb-1", "ml-4", orientation)
        .toString()}
      {...otherProps}
    >
      {children}
    </label>
  );
}

export interface FormFieldLabelProps extends HTMLProps<HTMLLabelElement> {
  orientation?: "vertical" | "horizontal";
}
