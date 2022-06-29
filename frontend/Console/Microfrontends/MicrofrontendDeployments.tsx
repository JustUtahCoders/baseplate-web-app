import { BaseplateUUID } from "../../../backend/DB/Models/SequelizeTSHelpers";
import { useParams } from "react-router";
import { Card, CardHeader } from "../../Styleguide/Card";
import { useLastMicrofrontendDeployments } from "./MicrofrontendConfiguration";
import { Loader } from "../../Styleguide/Loader";
import { unmistakablyIntelligibleDateFormat } from "../../Utils/dayjsUtils";
import { chunk, isUndefined } from "lodash-es";
import { Fragment, useState, useMemo, useEffect, useCallback } from "react";
import { always } from "kremling";

export function MicrofrontendDeployments() {
  const { customerOrgId, microfrontendId } = useParams<{
    customerOrgId: BaseplateUUID;
    microfrontendId: BaseplateUUID;
  }>();
  const latestDeploymentsQuery = useLastMicrofrontendDeployments(
    microfrontendId as string
  );
  const [cardDiv, setCardDiv] = useState<HTMLDivElement | null>(null);
  const [cols, setCols] = useState<number>(3);

  const envWidth = useMemo(() => {
    if (cols === 1) {
      return 12;
    } else if (cols === 2) {
      return 5;
    } else {
      return 2;
    }
  }, [cols]);

  const deploymentCardRef = useCallback<(node: HTMLDivElement) => void>(
    (node) => {
      setCardDiv(node);
      if (node) {
        setCols(numPipelineCols(node.getBoundingClientRect().width));
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };

    function handleResize() {
      setCols(numPipelineCols(cardDiv?.getBoundingClientRect().width));
    }
  });

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

  const arrowWidth = 1;
  const rowSeparatorWidth = `w-${cols * envWidth + (cols - 1) * arrowWidth}/12`;
  const environmentRows = chunk(
    latestDeploymentsQuery.data?.latestEnvironmentDeployments,
    cols
  );
  const missingColsLastRow =
    cols - (environmentRows[environmentRows.length - 1].length % cols);
  const lastRowWidthClass =
    missingColsLastRow < cols
      ? `w-${
          missingColsLastRow * envWidth + missingColsLastRow * arrowWidth
        }/12`
      : "";

  return (
    <>
      <Card
        ref={deploymentCardRef}
        header={
          <CardHeader>
            <h2 className="text-lg">Pipeline</h2>
          </CardHeader>
        }
      >
        <div className="my-6">
          {environmentRows.map((environmentRow, i) => (
            <Fragment key={i}>
              <div className="flex justify-center items-center">
                {environmentRow.map((envDep, j) => {
                  return (
                    <Fragment key={envDep.environment.id}>
                      {j % cols > 0 && (
                        <div
                          className={
                            "w-1/12 flex flex-row justify-between items-center"
                          }
                        >
                          <div className="border-b border-black w-full" />
                          <div className="text-2xs">{"\u25B6"}</div>
                        </div>
                      )}
                      <div
                        className={`w-${
                          envWidth === 12 ? "full" : envWidth + "/12"
                        } h-20 inline-block bg-gray-200 rounded inline-flex flex-col justify-center items-center`}
                      >
                        <div>{envDep.environment.name}</div>
                        <div className="text-xs text-gray-400">
                          {unmistakablyIntelligibleDateFormat(
                            envDep.latestDeployment
                          )}
                        </div>
                      </div>
                    </Fragment>
                  );
                })}
                {i === environmentRows.length - 1 && lastRowWidthClass && (
                  <div className={lastRowWidthClass}></div>
                )}
              </div>
              {cols > 1 && i + 1 < environmentRows.length && (
                <div
                  className={always(rowSeparatorWidth).always(
                    "mx-auto relative px-14"
                  )}
                >
                  <div
                    className="border-b border-r border-black h-6 rounded-br"
                    style={{ marginLeft: "3px" }}
                  />
                  <div className="border-l border-black h-6 rounded-tl" />
                  <div className="absolute left-12" style={{ bottom: "-6px" }}>
                    {"\u25BC"}
                  </div>
                </div>
              )}
              {cols === 1 && i + 1 < environmentRows.length && (
                <div className="flex justify-center relative">
                  <div
                    className={`border border-l-0 border-t-0 border-b-0 border-r border-black h-12`}
                  />
                  <div
                    className="absolute left-12"
                    style={{ left: "calc(50% - 8px)", bottom: "-6px" }}
                  >
                    {"\u25BC"}
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </Card>
      <Card
        className="mt-12"
        header={<CardHeader>Audit Trail</CardHeader>}
      ></Card>
    </>
  );
}

function numPipelineCols(cardWidth: number | undefined) {
  if (isUndefined(cardWidth)) {
    return 3;
  } else if (cardWidth < 300) {
    return 1;
  } else if (cardWidth < 500) {
    return 2;
  } else if (cardWidth < 575) {
    return 3;
  } else {
    return 4;
  }
}
