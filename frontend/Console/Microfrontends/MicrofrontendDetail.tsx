import { capitalize } from "lodash-es";
import { matchRoutes, Outlet, useLocation } from "react-router";
import { MainContent } from "../../Styleguide/MainContent";
import { PageExplanation, PageHeader } from "../../Styleguide/PageHeader";
import { useMicrofrontends } from "./MicrofrontendsList";
import { Breadcrumbs } from "../../Styleguide/Breadcrumbs";
import { Tabs } from "../../Styleguide/Tabs";
import { useRedirect } from "../../Utils/useRedirect";
import { Suspense, useState } from "react";
import { Loader } from "../../Styleguide/Loader";
import { useQueryClient } from "react-query";
import { useMicrofrontendParams } from "../../Utils/paramHelpers";

export function MicrofrontendDetail() {
  const [cnt, setCnt] = useState(0);
  const { customerOrgId, microfrontendId } = useMicrofrontendParams();
  const queryClient = useQueryClient();

  // For some reason, <Outlet>'s don't get executed on the server?
  // So the useRedirect in MicrofrontendHome doesn't get executed server side, but I want it to
  const location = useLocation();
  const isHomePage = Boolean(
    matchRoutes(
      [{ path: "/console/:orgId/microfrontends/:microfrontendId" }],
      location.pathname
    )
  );
  useRedirect(
    `/console/${customerOrgId}/microfrontends/${microfrontendId}/deployments`,
    isHomePage,
    true
  );

  const microfrontends = useMicrofrontends();

  const microfrontend = microfrontends.find((m) => m.id === microfrontendId);

  if (!microfrontend) {
    return (
      <MainContent>
        <PageHeader>Microfrontend not found</PageHeader>
        <PageExplanation
          docsLink="/docs/concepts/microfrontends"
          briefExplanation="The microfrontend ID in the URL is either incorrect or you do not have access to view this microfrontend."
        />
      </MainContent>
    );
  }

  return (
    <MainContent>
      <Breadcrumbs
        currentPage={microfrontend.name}
        crumbs={[
          {
            label: "Microfrontends",
            href: `/console/${customerOrgId}/microfrontends`,
          },
        ]}
      />
      <PageHeader badgeText="microfrontend">
        {capitalize(microfrontend.name)}
      </PageHeader>
      <PageExplanation
        docsLink="/docs/concepts/microfrontends"
        briefExplanation={`View and manage configuration, users, and deployments for the ${microfrontend.name} microfrontend.`}
      />
      <Tabs
        items={[
          {
            label: "Deployments",
            href: `/console/${customerOrgId}/microfrontends/${microfrontend.id}/deployments`,
          },
          {
            label: "Users",
            href: `/console/${customerOrgId}/microfrontends/${microfrontend.id}/users`,
          },
          {
            label: "Configuration",
            href: `/console/${customerOrgId}/microfrontends/${microfrontend.id}/configuration`,
          },
          {
            label: "About",
            href: `/console/${customerOrgId}/microfrontends/${microfrontend.id}/about`,
          },
        ]}
      />
      <Suspense
        fallback={
          <Loader description="Loading microfrontend page" delay={100} />
        }
      >
        <Outlet context={{ microfrontend, refetchMicrofrontend }} />
      </Suspense>
    </MainContent>
  );

  function refetchMicrofrontend() {
    queryClient.removeQueries(`microfrontends-${customerOrgId}`);
    setCnt(cnt + 1);
  }
}

export function MicrofrontendHome() {
  const params = useMicrofrontendParams();
  useRedirect(
    `/console/${params.customerOrgId}/microfrontends/${params.microfrontendId}/deployments`,
    true,
    true
  );

  return null;
}
