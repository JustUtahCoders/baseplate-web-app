import { BaseplateUUID } from "../../../backend/DB/Models/SequelizeTSHelpers";
import { useOutletContext, useParams } from "react-router";
import { MicrofrontendWithLastDeployed } from "../../../backend/RestAPI/Microfrontends/GetMicrofrontends";
import { Card, CardHeader } from "../../Styleguide/Card";
import { useLastMicrofrontendDeployments } from "./MicrofrontendConfiguration";
import { Loader } from "../../Styleguide/Loader";
import { unmistakablyIntelligibleDateFormat } from "../../Utils/dayjsUtils";
import { chunk } from "lodash-es";

export function MicrofrontendDeployments() {
  const { customerOrgId, microfrontendId } = useParams<{
    customerOrgId: BaseplateUUID;
    microfrontendId: BaseplateUUID;
  }>();
  const latestDeploymentsQuery = useLastMicrofrontendDeployments(
    microfrontendId as string
  );
  const cols = 3;

  if (latestDeploymentsQuery.isLoading) {
    return (
      <Card
        header={
          <CardHeader>
            <h2 className="text-lg">Deployment Log</h2>
          </CardHeader>
        }
      >
        <Loader description="Loading microfrontend deployments" />
      </Card>
    );
  }

  if (latestDeploymentsQuery.error) {
    return (
      <Card
        header={
          <CardHeader>
            <h2 className="text-lg">Deployment Log</h2>
          </CardHeader>
        }
      >
        <Loader description="Error loading microfrontend deployments" />
      </Card>
    );
  }

  const environmentRows = chunk(
    latestDeploymentsQuery.data?.latestEnvironmentDeployments,
    3
  );

  return (
    <Card
      header={
        <CardHeader>
          <h2 className="text-lg">Deployment Log</h2>
        </CardHeader>
      }
    >
      <div>
        {environmentRows.map((environmentRow, i) => (
          <>
            <div className="flex justify-center items-center">
              {environmentRow.map((envDep, j) => {
                return (
                  <>
                    {j % 3 > 0 && (
                      <>
                        <div className="border-b border-black w-1/12 text-xs flex justify-end" />
                        <div className="text-2xs">{"\u25B6"}</div>
                      </>
                    )}
                    <div className="w-2/12 h-20 inline-block bg-gray-200 rounded my-4 inline-flex flex-col justify-center items-center">
                      <div>{envDep.environment.name}</div>
                      <div>
                        {unmistakablyIntelligibleDateFormat(
                          envDep.latestDeployment
                        )}
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
            {i + 1 < environmentRow.length && (
              <>
                <div className="border-r border-black h-6"></div>
                <div className="border-b border-black h-1"></div>
                <div className="border-l border-black h-6"></div>
              </>
            )}
          </>
        ))}
      </div>
    </Card>
  );
}
