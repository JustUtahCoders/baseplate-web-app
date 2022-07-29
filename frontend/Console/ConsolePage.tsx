import { Outlet, useLocation } from "react-router";
import { IconVariant } from "../Styleguide/Icon";
import { PrimaryNav } from "../Styleguide/PrimaryNav";
import { SecondaryNav, SecondaryNavLink } from "../Styleguide/SecondaryNav";
import { useConsoleParams } from "../Utils/paramHelpers";
import { useRedirect } from "../Utils/useRedirect";
import { ConsoleNavOrgSelect } from "./ConsoleNavOrgSelect";

export function ConsolePage() {
  const { customerOrgId } = useConsoleParams();
  const location = useLocation();
  useRedirect(
    "/console/microfrontends",
    location.pathname === "/console",
    true
  );

  return (
    <>
      <PrimaryNav />
      <SecondaryNav>
        <ConsoleNavOrgSelect />
        <SecondaryNavLink
          to={`/console/${customerOrgId}/microfrontends`}
          icon={IconVariant.required}
        >
          Microfrontends
        </SecondaryNavLink>
        <SecondaryNavLink
          to={`/console/${customerOrgId}/environments`}
          icon={IconVariant.move}
        >
          Environments
        </SecondaryNavLink>
        <SecondaryNavLink
          to={`/console/${customerOrgId}/org-settings`}
          icon={IconVariant.close}
        >
          Settings
        </SecondaryNavLink>
      </SecondaryNav>
      <Outlet />
    </>
  );
}
