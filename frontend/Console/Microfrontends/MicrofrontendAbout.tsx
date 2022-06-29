import { useOutletContext } from "react-router";
import { Anchor } from "../../Styleguide/Anchor";
import { ButtonKind } from "../../Styleguide/Button";
import { ConfigurationTable } from "../../Styleguide/ConfigurationTable";
import { unmistakablyIntelligibleDateFormat } from "../../Utils/dayjsUtils";
import { MicrofrontendWithLastDeployed } from "../../../backend/RestAPI/Microfrontends/GetMicrofrontends";
import {
  useLastMicrofrontendDeployments,
  useMicrofrontendActiveQuery,
} from "./MicrofrontendConfiguration";
import { Loader } from "../../Styleguide/Loader";
import { ErrorLoading } from "../../Styleguide/ErrorLoading";
import { Card, CardHeader } from "../../Styleguide/Card";
import { ReactNode } from "react";

export function MicrofrontendAbout() {
  const { microfrontend, refetchMicrofrontend } = useOutletContext<{
    microfrontend: MicrofrontendWithLastDeployed;
    refetchMicrofrontend(): void;
  }>();

  const activeQuery = useMicrofrontendActiveQuery();
  const latestDeploymentsQuery = useLastMicrofrontendDeployments(
    microfrontend.id
  );
  let cardContent: ReactNode;

  if (activeQuery.isLoading) {
    cardContent = <Loader description="Loading microfrontend activity" />;
  } else if (activeQuery.isError) {
    cardContent = <ErrorLoading thingBeingLoaded="microfrontend activity" />;
  } else if (latestDeploymentsQuery.isLoading) {
    cardContent = (
      <Loader
        description={`Loading ${microfrontend.name} latest deployments`}
      />
    );
  } else if (latestDeploymentsQuery.error) {
    cardContent = (
      <Card>
        <ErrorLoading
          thingBeingLoaded={`${microfrontend.name} latest deployments`}
        />
      </Card>
    );
  } else {
    const isActive = activeQuery.data!.isActive;
    cardContent = (
      <ConfigurationTable
        sections={[
          {
            label: "Usage",
            items: [
              {
                label: "Active",
                element: !isActive ? "Yes" : "No",
              },
              {
                label: "Last Deployed",
                element: unmistakablyIntelligibleDateFormat(
                  microfrontend.deployedAt
                ),
              },
              {
                label: "Created",
                element: unmistakablyIntelligibleDateFormat(
                  microfrontend.createdAt
                ),
              },
              {
                label: "Updated",
                element: unmistakablyIntelligibleDateFormat(
                  microfrontend.updatedAt
                ),
              },
            ],
          },
          {
            label: "Environments",
            items:
              latestDeploymentsQuery.data!.latestEnvironmentDeployments.map(
                (latestDeploy) => ({
                  label: latestDeploy.environment.name,
                  items: [
                    {
                      label: "Entry URL",
                      element: latestDeploy.entryUrl ? (
                        <Anchor
                          rel="noopener"
                          target="_blank"
                          href={latestDeploy.entryUrl}
                          kind={ButtonKind.classic}
                        >
                          {latestDeploy.entryUrl}
                        </Anchor>
                      ) : (
                        "\u2014"
                      ),
                    },
                    {
                      label: "Latest Deployment",
                      element: unmistakablyIntelligibleDateFormat(
                        latestDeploy.latestDeployment
                      ),
                    },
                    {
                      label: "Total Deployments",
                      element: isNaN(latestDeploy.deploymentCount as number)
                        ? "0"
                        : (
                            latestDeploy.deploymentCount as number
                          ).toLocaleString(),
                    },
                  ],
                })
              ),
          },
        ]}
      />
    );
  }

  return <Card header={<CardHeader>About</CardHeader>}>{cardContent}</Card>;
}
