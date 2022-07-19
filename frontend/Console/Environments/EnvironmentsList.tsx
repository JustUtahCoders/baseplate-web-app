import { useMutation, useQuery, useQueryClient } from "react-query";
import { baseplateFetch } from "../../Utils/baseplateFetch";
import { useConsoleParams } from "../../Utils/paramHelpers";
import { Card, CardFooter } from "../../Styleguide/Card";
import { MainContent } from "../../Styleguide/MainContent";
import { useContext, useMemo, useState } from "react";
import { RootPropsContext } from "../../App";
import { Input } from "../../Styleguide/Input";
import { Button, ButtonKind, ButtonSize } from "../../Styleguide/Button";
import Fuse from "fuse.js";
import { Anchor } from "../../Styleguide/Anchor";
import {
  EndpointGetEnvironmentsResBody,
  EnvironmentWithLastDeployed,
} from "../../../backend/RestAPI/Environments/GetEnvironments";
import { PageExplanation, PageHeader } from "../../Styleguide/PageHeader";
import dayjs from "dayjs";
import {
  Environment,
  EnvironmentCreationAttributes,
  EnvironmentUpdateAttributes,
} from "../../../backend/DB/Models/Environment/Environment";
import { BaseplateUUID } from "../../../backend/DB/Models/SequelizeTSHelpers";

export function EnvironmentsList() {
  const { customerOrgId } = useConsoleParams();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const environments = useEnvironments();

  const filteredEnvironments = useMemo<EnvironmentWithLastDeployed[]>(() => {
    if (search.trim() === "") {
      return environments;
    } else {
      const fuse = new Fuse(environments, {
        keys: ["name"],
      });
      const fuseResult = fuse.search<EnvironmentWithLastDeployed>(search);
      return fuseResult.map((r) => r.item);
    }
  }, [environments, search]);

  interface MutationProps {
    environmentId: BaseplateUUID;
    patch: EnvironmentUpdateAttributes;
  }

  function refetchEnvironments() {
    queryClient.invalidateQueries(`environments-${customerOrgId}`);
  }

  const { mutate: updateEnvironment } = useMutation<
    Environment,
    Error,
    MutationProps
  >(
    ({ environmentId, patch }) => {
      return baseplateFetch<Environment>(
        `/api/orgs/${customerOrgId}/environments/${environmentId}`,
        {
          method: "PATCH",
          body: patch,
        }
      );
    },
    {
      onSuccess: refetchEnvironments,
    }
  );

  const handleMoveUp = (environment, index) => {
    const previousEnvironment = environments[index - 1];
    if (previousEnvironment) {
      // Swap the two pipelineOrders
      updateEnvironment({
        environmentId: environment.id,
        patch: { pipelineOrder: previousEnvironment.pipelineOrder },
      });
      updateEnvironment({
        environmentId: previousEnvironment.id,
        patch: { pipelineOrder: environment.pipelineOrder },
      });
    }
  };

  const handleMoveDown = (environment, index) => {
    const nextEnvironment = environments[index + 1];
    if (nextEnvironment) {
      // Swap the two pipelineOrders
      updateEnvironment({
        environmentId: environment.id,
        patch: { pipelineOrder: nextEnvironment.pipelineOrder },
      });
      updateEnvironment({
        environmentId: nextEnvironment.id,
        patch: { pipelineOrder: environment.pipelineOrder },
      });
    }
  };

  return (
    <MainContent>
      <PageHeader>Environments List</PageHeader>
      <PageExplanation
        docsLink="/docs/concepts/environments"
        briefExplanation={
          <span>
            Environments are standalone, self-contained instances of your web
            application. Many teams use environments called <em>development</em>
            , <em>staging</em>, and <em>production</em>.
          </span>
        }
      />
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Find environments"
          value={search}
          onChange={(evt) => setSearch(evt.target.value)}
          className="w-full"
        />
      </div>
      {filteredEnvironments.map((environment, index) => (
        <EnvironmentCard
          environment={environment}
          key={environment.id}
          index={index}
          numEnvironments={filteredEnvironments.length}
          handleMoveUp={handleMoveUp}
          handleMoveDown={handleMoveDown}
          search={search}
        />
      ))}
    </MainContent>
  );
}

export function useEnvironments(): EnvironmentWithLastDeployed[] {
  const { customerOrgId } = useConsoleParams();
  const queryResult = useQuery<unknown, Error, EnvironmentWithLastDeployed[]>(
    `environments-${customerOrgId}`,
    async function () {
      if (global.IN_WEBPACK) {
        return (
          await baseplateFetch<EndpointGetEnvironmentsResBody>(
            `/api/orgs/${customerOrgId}/environments`
          )
        ).environments;
      } else {
        const getEnvironments = await import(
          /* webpackIgnore: true */ "../../../backend/RestAPI/Environments/GetEnvironments"
        );

        // @ts-ignore
        const res = await getEnvironments.getEnvironmentsWithDeployedAt(
          customerOrgId
        );

        return res.environments;
      }
    },
    {
      suspense: true,
    }
  );

  return queryResult.data!;
}

function EnvironmentCard({
  environment,
  index,
  search,
  numEnvironments,
  handleMoveUp,
  handleMoveDown,
}: {
  environment: EnvironmentWithLastDeployed;
  index: number;
  search: string;
  numEnvironments: number;
  handleMoveUp: Function;
  handleMoveDown: Function;
}) {
  const rootProps = useContext(RootPropsContext);
  const { customerOrgId } = useConsoleParams();

  let lastDeployed: string;
  if (environment.deployedAt) {
    lastDeployed = `Last deployed ${dayjs(environment.deployedAt).fromNow()}`;
  } else {
    lastDeployed = `Never deployed`;
  }

  return (
    <Anchor
      className="block"
      kind={ButtonKind.transparent}
      to={`/console/${customerOrgId}/environments/${environment.id}`}
    >
      <Card
        className="mb-4"
        footer={
          <CardFooter className="text-gray-700 text-sm flex justify-end">
            {lastDeployed}
          </CardFooter>
        }
      >
        <div className="flex justify-between">
          <div>{environment.name}</div>
          {/* Do not show reordering buttons if a filter is applied */}
          {!search && (
            <div>
              {index !== 0 && (
                <Button
                  type="button"
                  onClick={(evt) => {
                    evt.preventDefault();
                    handleMoveUp(environment, index);
                  }}
                  kind={ButtonKind.secondary}
                  buttonSize={ButtonSize.small}
                >
                  move up
                </Button>
              )}
              {index < numEnvironments - 1 && (
                <Button
                  type="button"
                  onClick={(evt) => {
                    evt.preventDefault();
                    handleMoveDown(environment, index);
                  }}
                  kind={ButtonKind.secondary}
                  buttonSize={ButtonSize.small}
                >
                  move down
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </Anchor>
  );
}
