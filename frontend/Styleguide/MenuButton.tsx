import "@reach/menu-button/styles.css";
import { MenuButton as ReachMenuButton } from "@reach/menu-button";
export {
  Menu,
  MenuList,
  MenuItem,
  MenuItems,
  MenuPopover,
  MenuLink,
} from "@reach/menu-button";
import { ReactElement, ReactNode } from "react";
import { buttonClasses, ButtonProps, ButtonSize } from "./Button";

export function MenuButton(props: MenuButtonProps): ReactElement {
  const {
    kind,
    buttonSize = ButtonSize.large,
    className,
    disabled,
    ...otherProps
  } = props;
  return (
    <ReachMenuButton
      className={buttonClasses(kind, buttonSize, className, disabled)}
      {...otherProps}
    >
      {props.children}
    </ReachMenuButton>
  );
}

interface MenuButtonProps extends ButtonProps {
  children: ReactNode;
}
