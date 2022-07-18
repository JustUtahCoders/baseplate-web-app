import { useQuery } from "react-query";
import { baseplateFetch } from "../../Utils/baseplateFetch";
import { useConsoleParams } from "../../Utils/paramHelpers";
import { Card, CardFooter } from "../../Styleguide/Card";
import { MainContent } from "../../Styleguide/MainContent";
import { useContext, useMemo, useState } from "react";
import { RootPropsContext } from "../../App";
import { Input } from "../../Styleguide/Input";
import { ButtonKind } from "../../Styleguide/Button";
import Fuse from "fuse.js";
import { Anchor } from "../../Styleguide/Anchor";
import {
  EndpointGetEnvironmentsResBody,
  EnvironmentWithLastDeployed,
} from "../../../backend/RestAPI/Environments/GetEnvironments";
import { PageExplanation, PageHeader } from "../../Styleguide/PageHeader";
import dayjs from "dayjs";

export function EnvironmentsList() {
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
      {filteredEnvironments.map((environment) => (
        <EnvironmentCard environment={environment} key={environment.id} />
      ))}
    </MainContent>
  );
}

export function useEnvironments(): EnvironmentWithLastDeployed[] {
  const { customerOrgId } = useConsoleParams();
  const rootProps = useContext(RootPropsContext);
  const queryResult = useQuery<unknown, Error, EnvironmentWithLastDeployed[]>(
    `environments-${customerOrgId}`,
    async function () {
      return (
        await baseplateFetch<EndpointGetEnvironmentsResBody>(
          `/api/orgs/${customerOrgId}/environments`,
          {},
          rootProps
        )
      ).environments;
    },
    {
      suspense: true,
    }
  );

  return queryResult.data!;
}

function EnvironmentCard({
  environment,
}: {
  environment: EnvironmentWithLastDeployed;
}) {
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
          <div>
            <div>{environment.name}</div>
          </div>
        </div>
      </Card>
    </Anchor>
  );
}
