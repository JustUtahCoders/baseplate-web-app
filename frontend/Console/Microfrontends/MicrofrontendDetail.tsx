import { capitalize } from "lodash-es";
import { Outlet, useParams } from "react-router";
import { MainContent } from "../../Styleguide/MainContent";
import { PageExplanation, PageHeader } from "../../Styleguide/PageHeader";
import { useMicrofrontends } from "./MicrofrontendsList";
import { Breadcrumbs } from "../../Styleguide/Breadcrumbs";
import { useCustomerOrgId } from "../../Utils/useCustomerOrgId";
import { Tabs } from "../../Styleguide/Tabs";
import { useRedirect } from "../../Utils/useRedirect";
import { Suspense } from "react";
import { Loader } from "../../Styleguide/Loader";

export function MicrofrontendDetail() {
  const params = useParams<{
    microfrontendId: string;
    customerOrgId: string;
  }>();
  const microfrontends = useMicrofrontends();
  const customerOrgId = useCustomerOrgId();

  const microfrontend = microfrontends.find(
    (m) => m.id === params.microfrontendId
  );

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
      <PageHeader>{capitalize(microfrontend.name)} microfrontend</PageHeader>
      <PageExplanation
        docsLink="/docs/concepts/microfrontends"
        briefExplanation={`View and manage settings, users, and deployments for the ${microfrontend.name} microfrontend.`}
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
            label: "Settings",
            href: `/console/${customerOrgId}/microfrontends/${microfrontend.id}/settings`,
          },
        ]}
      />
      <Suspense
        fallback={
          <Loader description="Loading microfrontend page" delay={100} />
        }
      >
        <Outlet />
      </Suspense>
    </MainContent>
  );
}

export function MicrofrontendHome() {
  const params = useParams<{
    customerOrgId: string;
    microfrontendId: string;
  }>();
  useRedirect(
    `/console/${params.customerOrgId}/microfrontends/${params.microfrontendId}/deployments`
  );

  return null;
}
