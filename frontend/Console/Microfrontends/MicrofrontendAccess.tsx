import { useQuery } from "react-query";
import { EndpointGetMicrofrontendAccessResBody } from "../../../backend/RestAPI/Microfrontends/GetMicrofrontendAccessList";
import { Card, CardHeader } from "../../Styleguide/Card";
import { Loader } from "../../Styleguide/Loader";
import { baseplateFetch } from "../../Utils/baseplateFetch";
import { useMicrofrontendParams } from "../../Utils/paramHelpers";
import { Button, ButtonKind, ButtonSize } from "../../Styleguide/Button";
import {
  BaseplateUserAccess,
  UserAccess,
  UserWithAccess,
} from "../../Styleguide/UserAccess";
import { ShareableUserAttributes } from "../../../backend/DB/Models/User/User";
import { useMemo } from "react";

export function MicrofrontendAccess() {
  const { microfrontendId, customerOrgId } = useMicrofrontendParams();
  const usersQuery = useQuery<
    unknown,
    Error,
    EndpointGetMicrofrontendAccessResBody
  >(`microfrontend-users-${microfrontendId}`, async () => {
    return baseplateFetch<EndpointGetMicrofrontendAccessResBody>(
      `/api/orgs/${customerOrgId}/microfrontends/${microfrontendId}/access`
    );
  });
  const accessList = useMemo<UserWithAccess[]>(() => {
    if (!usersQuery.data) {
      return [];
    }

    const processedUsers: { [key: string]: UserWithAccess } = {};
    const accessList: UserWithAccess[] = [];
    // processList(BaseplateUserAccess.admin, usersQuery.data.microfrontendAdmins);
    // processList(
    //   BaseplateUserAccess.owner,
    //   usersQuery.data.thisMicrofrontendOwners
    // );
    // processList(
    //   BaseplateUserAccess.collaborator,
    //   usersQuery.data.thisMicrofrontendUsers
    // );

    return accessList;

    function processList(
      accessLevel: BaseplateUserAccess,
      list: ShareableUserAttributes[]
    ) {
      list.forEach((user) => {
        let userWithAccess: UserWithAccess = processedUsers[user.id];

        if (userWithAccess) {
          if (accessLevel !== BaseplateUserAccess.collaborator) {
            userWithAccess.access.push(accessLevel);
          }
        } else {
          userWithAccess = {
            user,
            access: [accessLevel],
          };

          accessList.push(userWithAccess);
        }

        processedUsers[user.id] = userWithAccess;
      });
    }
  }, [usersQuery.data]);

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
      <UserAccess accessList={accessList} />
    </Card>
  );
}
