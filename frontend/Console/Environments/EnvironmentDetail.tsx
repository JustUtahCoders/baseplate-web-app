import { capitalize } from "lodash-es";
import { Suspense, useState } from "react";
import { useQueryClient } from "react-query";
import { Outlet } from "react-router";
import { Breadcrumbs } from "../../Styleguide/Breadcrumbs";
import { Loader } from "../../Styleguide/Loader";
import { MainContent } from "../../Styleguide/MainContent";
import { PageExplanation, PageHeader } from "../../Styleguide/PageHeader";
import { Tabs } from "../../Styleguide/Tabs";
import { useEnvironmentParams } from "../../Utils/paramHelpers";
import { useRedirect } from "../../Utils/useRedirect";
import { useEnvironments } from "./EnvironmentsList";

export function EnvironmentDetail() {
  const [cnt, setCnt] = useState(0);
  const queryClient = useQueryClient();
  const { customerOrgId, environmentId } = useEnvironmentParams();
  const environments = useEnvironments();
  const environment = environments.find((env) => env.id === environmentId);

  if (!environment) {
    return (
      <MainContent>
        <PageHeader>Environment not found</PageHeader>
        <PageExplanation
          docsLink="/docs/concepts/environments"
          briefExplanation="The environment ID in the URL is either incorrect or you do not have access to view this environment."
        />
      </MainContent>
    );
  }

  return (
    <MainContent>
      <Breadcrumbs
        currentPage={environment.name}
        crumbs={[
          {
            label: "Environments",
            href: `/console/${customerOrgId}/environments`,
          },
        ]}
      />
      <PageHeader badgeText="environment">
        {capitalize(environment.name)}
      </PageHeader>
      <PageExplanation
        docsLink="/docs/concepts/environments"
        briefExplanation={`View and manage configuration and users for the ${environment.name} environment.`}
      />
      <Tabs
        items={[
          {
            label: "Configuration",
            href: `/console/${customerOrgId}/environments/${environment.id}/configuration`,
          },
          {
            label: "Access",
            href: `/console/${customerOrgId}/environments/${environment.id}/access`,
          },
          // {
          //   label: "About",
          //   href: `/console/${customerOrgId}/environments/${environment.id}/about`,
          // },
        ]}
      />
      <Suspense
        fallback={<Loader description="Loading environment page" delay={100} />}
      >
        <Outlet context={{ environment, refetchEnvironment }} />
      </Suspense>
    </MainContent>
  );

  function refetchEnvironment() {
    queryClient.removeQueries(`environments-${customerOrgId}`);
    setCnt(cnt + 1);
  }
}

export function EnvironmentHome() {
  const params = useEnvironmentParams();
  useRedirect(
    `/console/${params.customerOrgId}/environments/${params.environmentId}/configuration`,
    true,
    true
  );

  return null;
}
