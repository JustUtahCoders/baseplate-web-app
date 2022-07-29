import { Outlet } from "react-router";
import { MainContent } from "../../Styleguide/MainContent";
import { PageExplanation, PageHeader } from "../../Styleguide/PageHeader";
import { Tabs } from "../../Styleguide/Tabs";
import { useConsoleParams } from "../../Utils/paramHelpers";

export function OrgSettingsPage() {
  const { customerOrgId } = useConsoleParams();

  return (
    <MainContent>
      <PageHeader>Manage your organization's settings</PageHeader>
      <PageExplanation briefExplanation="View and manage access, global settings, payments, and subscriptions." />
      <Tabs
        items={[
          {
            label: "Configuration",
            href: `/console/${customerOrgId}/org-settings/configuration`,
          },
          {
            label: "Access",
            href: `/console/${customerOrgId}/org-settings/access`,
          },
          {
            label: "Subscription",
            href: `/console/${customerOrgId}/org-settings/subscription`,
          },
        ]}
      />
      <Outlet />
    </MainContent>
  );
}
