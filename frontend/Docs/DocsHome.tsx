import { Outlet } from "react-router";
import { SkipHydration } from "../Utils/SkipHydration";

export function DocsHome(props: Props) {
  return (
    <div>
      Nav goes here
      <SkipHydration>
        <Outlet />
      </SkipHydration>
    </div>
  );
}

interface Props {}
