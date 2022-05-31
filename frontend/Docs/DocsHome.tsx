import { Outlet } from "react-router";
import { Anchor } from "../Styleguide/Anchor";
import { ButtonKind } from "../Styleguide/Button";
import { SkipHydration } from "../Utils/SkipHydration";

export function DocsHome(props: Props) {
  return (
    <div>
      <nav>
        <ul>
          <li>API</li>
          <li>
            <Anchor kind={ButtonKind.classic} to="/docs/api/cli">
              CLI
            </Anchor>
          </li>
        </ul>
      </nav>
      {/* Code Formatting in MDX only configured in Node */}
      <SkipHydration>
        <Outlet />
      </SkipHydration>
    </div>
  );
}

interface Props {}
