import { useMutation, useQuery, useQueryClient } from "react-query";
import { baseplateFetch } from "../../Utils/baseplateFetch";
import { useConsoleParams } from "../../Utils/paramHelpers";
import { Card, CardFooter } from "../../Styleguide/Card";
import { MainContent } from "../../Styleguide/MainContent";
import { useContext, useMemo, useState } from "react";
import { RootPropsContext } from "../../App";
import { Input } from "../../Styleguide/Input";
import { ButtonKind, ButtonSize } from "../../Styleguide/Button";
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
  EnvironmentUpdateAttributes,
} from "../../../backend/DB/Models/Environment/Environment";
import { EnvironmentsReorderModal } from "./EnvironmentsReorderModal";
import { BaseplateUUID } from "../../../backend/DB/Models/SequelizeTSHelpers";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuPopover,
  MenuLink,
} from "../../Styleguide/MenuButton";
import { positionRight } from "@reach/popover";

export function EnvironmentsList() {
  const { customerOrgId } = useConsoleParams();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

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

  const { mutate: updateEnvironmentsOrder, isLoading: isSavingEnvironments } =
    useMutation<Environment, Error, EnvironmentWithLastDeployed[]>(
      (orderedEnvs) => {
        return baseplateFetch<Environment>(
          `/api/orgs/${customerOrgId}/environments/order`,
          {
            method: "PATCH",
            body: {
              environmentIds: orderedEnvs.map(({ id }) => id),
            },
          }
        );
      },
      {
        onSuccess: refetchEnvironments,
      }
    );

  const saveEnvironmentsOrder = (updatedEnvironments) => {
    updateEnvironmentsOrder(updatedEnvironments);
  };

  return (
    <MainContent>
      <PageHeader
        menu={
          <Menu>
            <MenuButton
              kind={ButtonKind.secondary}
              buttonSize={ButtonSize.medium}
            >
              Actions
              <span aria-hidden className="ml-1">
                ▾
              </span>
            </MenuButton>
            <MenuPopover position={positionRight}>
              <MenuItems>
                <MenuItem onSelect={() => setIsReorderModalOpen(true)}>
                  Reorder Environments
                </MenuItem>
                <MenuLink
                  as="a"
                  href={`/console/${customerOrgId}/environments/new`}
                >
                  Add an Environment
                </MenuLink>
              </MenuItems>
            </MenuPopover>
          </Menu>
        }
      >
        Environments List
      </PageHeader>
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
        <EnvironmentCard environment={environment} key={environment.id} />
      ))}
      {isReorderModalOpen && (
        <EnvironmentsReorderModal
          title="Reorder Environments"
          close={() => setIsReorderModalOpen(false)}
          save={saveEnvironmentsOrder}
          environments={environments}
          isSaving={isSavingEnvironments}
        />
      )}
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
        <div className="flex items-center">
          <div>{environment.name}</div>
          {environment.isProd && (
            <div
              style={{ maxHeight: "26px" }}
              className="ml-3 uppercase text-xs tracking-widest rounded bg-gray-200 text-gray-700 py-1 px-2"
            >
              Prod
            </div>
          )}
        </div>
      </Card>
    </Anchor>
  );
}
