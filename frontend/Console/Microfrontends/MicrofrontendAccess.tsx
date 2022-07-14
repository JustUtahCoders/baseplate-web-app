import { useQuery } from "react-query";
import { EndpointGetMicrofrontendAccessResBody } from "../../../backend/RestAPI/Microfrontends/GetMicrofrontendAccessList";
import { Card, CardHeader } from "../../Styleguide/Card";
import { Loader } from "../../Styleguide/Loader";
import { baseplateFetch } from "../../Utils/baseplateFetch";
import { useMicrofrontendParams } from "../../Utils/paramHelpers";
import { Button, ButtonKind, ButtonSize } from "../../Styleguide/Button";
import {
  EntityAccess,
  EntityWithAccessAndRoles,
} from "../../Styleguide/EntityAccess";
import { BaseplatePermission } from "../../../backend/DB/Models/IAM/Permission";

export function MicrofrontendAccess() {
  const { microfrontendId, customerOrgId } = useMicrofrontendParams();
  const usersQuery = useQuery<unknown, Error, EntityWithAccessAndRoles[]>(
    `microfrontend-users-${microfrontendId}`,
    async () => {
      const data = await baseplateFetch<EndpointGetMicrofrontendAccessResBody>(
        `/api/orgs/${customerOrgId}/microfrontends/${microfrontendId}/access`
      );

      const map: Record<string, EntityWithAccessAndRoles> = {};

      return data.accessList.map((accessItem) => {
        // @ts-ignore
        accessItem.roles = [
          accessItem.permissions.some(
            (p) => p.name === "allMicrofrontends.settings.manage"
          ) && "admin",
          accessItem.permissions.some(
            (p) =>
              p.name === "microfrontend.owner.manage" ||
              p.name === "allMicrofrontends.settings.manage"
          ) && "owner",
          accessItem.permissions.some(
            (p) =>
              p.name === "microfrontend.deployments.trigger" ||
              p.name === "allMicrofrontends.deployments.trigger" ||
              p.name === "allMicrofrontends.settings.manage"
          ) && "deployer",
        ].filter(Boolean);
        return accessItem;
      });
    }
  );

  if (usersQuery.isLoading) {
    return (
      <Card>
        <Loader description="Loading microfrontend users" />
      </Card>
    );
  }

  if (usersQuery.isError) {
    return <Card>Error loading microfrontend users.</Card>;
  }

  return (
    <Card
      contentPadding={false}
      header={
        <CardHeader
          contentPadding={false}
          className="flex justify-between items-center"
        >
          <h1>Microfrontend Access</h1>
          <Button kind={ButtonKind.primary} buttonSize={ButtonSize.medium}>
            Add people
          </Button>
        </CardHeader>
      }
    >
      <EntityAccess accessList={usersQuery.data!} />
    </Card>
  );
}
