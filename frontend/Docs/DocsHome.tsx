import { Outlet } from "react-router";

export function DocsHome(props: Props) {
  return (
    <div>
      Nav goes here
      <Outlet />
    </div>
  );
}

interface Props {}
