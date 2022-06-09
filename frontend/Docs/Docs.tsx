import { Outlet } from "react-router";
import { PrimaryNav } from "../Styleguide/PrimaryNav";
import { MainContent } from "../Styleguide/MainContent";
import {
  SecondaryNav,
  SecondaryNavLink,
  SecondaryNavSection,
} from "../Styleguide/SecondaryNav";

export function Docs(props: Props) {
  return (
    <>
      <PrimaryNav />
      <SecondaryNav>
        <SecondaryNavSection text="Deployments">
          <SecondaryNavLink to="/docs/api/cli">CLI</SecondaryNavLink>
        </SecondaryNavSection>
      </SecondaryNav>
      <MainContent leftAlign padding>
        <Outlet />
      </MainContent>
    </>
  );
}

interface Props {}
