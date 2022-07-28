import { Outlet, useLocation } from "react-router";
import { IconVariant } from "../Styleguide/Icon";
import { PrimaryNav } from "../Styleguide/PrimaryNav";
import { SecondaryNav, SecondaryNavLink } from "../Styleguide/SecondaryNav";
import { useConsoleParams } from "../Utils/paramHelpers";
import { useRedirect } from "../Utils/useRedirect";

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
        <SecondaryNavLink
          to={`/console/${customerOrgId}/microfrontends`}
          icon={IconVariant.puzzle}
        >
          Microfrontends
        </SecondaryNavLink>
        <SecondaryNavLink
          to={`/console/${customerOrgId}/environments`}
          icon={IconVariant.globe}
        >
          Environments
        </SecondaryNavLink>
        <SecondaryNavLink
          to={`/console/${customerOrgId}/org-settings`}
          icon={IconVariant.settings}
        >
          Org Settings
        </SecondaryNavLink>
      </SecondaryNav>
      <Outlet />
    </>
  );
}
