import { always } from "kremling";
import { capitalize } from "lodash-es";
import { FormEvent, Fragment, ReactNode, useContext } from "react";
import { useOutletContext } from "react-router";
import { ShareableUserAttributes } from "../../backend/DB/Models/User/User";
import { MicrofrontendWithLastDeployed } from "../../backend/RestAPI/Microfrontends/GetMicrofrontends";
import { RootPropsContext } from "../App";
import { Button, ButtonKind, ButtonSize } from "./Button";
import { useMutation } from "react-query";
import { baseplateFetch } from "../Utils/baseplateFetch";
import { useMicrofrontendParams } from "../Utils/paramHelpers";
import { EntityWithAccess } from "../../backend/RestAPI/Microfrontends/GetMicrofrontendAccessList";
import { unmistakablyIntelligibleDateFormat } from "../Utils/dayjsUtils";

export function EntityAccess(props: EntityAccessProps) {
  const { microfrontend, refetchMicrofrontend } = useOutletContext<{
    microfrontend: MicrofrontendWithLastDeployed;
    refetchMicrofrontend(): void;
  }>();
  const { customerOrgId, microfrontendId } = useMicrofrontendParams();
  const rootProps = useContext(RootPropsContext);
  const submitMutation = useMutation<void, Error, FormEvent>(async (evt) => {
    evt.preventDefault();
    return baseplateFetch(
      `/api/orgs/${customerOrgId}/microfrontends/${microfrontendId}`,
      {
        method: "PATCH",
        body: {},
      }
    );
  });

  return (
    <>
      {props.accessList.map((accessItem, i) => {
        const isCurrentUser =
          accessItem.entityType === "user" &&
          accessItem.user.id ===
            rootProps.userInformation.userPreferences?.userId;
        let name: string | ReactNode, detail: string | ReactNode;
        switch (accessItem.entityType) {
          case "user":
            name = (
              <span>
                {accessItem.user.givenName} {accessItem.user.familyName}
                {isCurrentUser && <span className="text-gray-600"> (you)</span>}
              </span>
            );
            detail = (
              <>
                <div>{accessItem.user.email}</div>
                {accessItem.personalAccessTokens.length > 0 && (
                  <div>
                    {accessItem.personalAccessTokens.length.toLocaleString()}{" "}
                    personal access token
                    {accessItem.personalAccessTokens.length === 1 ? "" : "s"}
                  </div>
                )}
              </>
            );
            break;
          case "serviceAccountToken":
            name = accessItem.name || "(unnamed)";
            detail = (
              <>
                <div style={{ fontSize: ".6rem" }} className="text-gray-400">
                  {accessItem.id}
                </div>
                <div>
                  Last used:{" "}
                  {accessItem.lastUsed
                    ? unmistakablyIntelligibleDateFormat(accessItem.lastUsed)
                    : "\u2014"}
                </div>
              </>
            );
            break;
          default:
            throw Error(
              // @ts-ignore
              `Unknown accessList entityType '${accessItem.entityType}'`
            );
        }

        return (
          <div
            key={accessItem.id}
            className={always(
              "flex justify-between items-center px-3.5 py-3 border-b border-gray-300"
            ).maybe(
              "border-b border-gray-400",
              i < props.accessList.length - 1
            )}
          >
            <div className="flex items-center">
              <div className="text-sm">
                <div className="flex items-center">{name}</div>
                <div className="text-gray-600 text-xs">{detail}</div>
                <div className="text-xs text-gray-600">
                  {accessItem.roles.map((role, i) => (
                    <Fragment key={role}>
                      {i !== 0 && <span> • </span>}
                      <span className="text-amber-600">{capitalize(role)}</span>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div
                style={{ maxHeight: "26px" }}
                className="ml-4 uppercase text-sm tracking-widest rounded bg-gray-200 text-gray-700 py-1 px-2"
              >
                {capitalize(
                  accessItem.entityType === "serviceAccountToken"
                    ? "Service Account"
                    : "user"
                )}
              </div>
            </div>
            {!isCurrentUser && (
              <Button
                type="button"
                kind={ButtonKind.transparent}
                className="text-gray-500 hover:bg-gray-200 rounded hover:text-primary px-2 py-1 text-xs"
              >
                Modify
              </Button>
            )}
          </div>
        );
      })}
      {/* {usersBeingModified.length > 0 && (
        <Modal
          close={() => setUsersBeingModified([])}
          title="Microfrontend access"
        >
          <form onSubmit={submitMutation.mutate}>
            <div className="text-gray-700 text-xs mb-6">
              Modify{" "}
              {usersBeingModified.length === 1
                ? usersBeingModified[0].user.givenName +
                  " " +
                  usersBeingModified[0].user.familyName +
                  "'s "
                : usersBeingModified.length.toLocaleString() + " users' "}
              access to {microfrontend.name}.
            </div>
            <label className="flex items-center mb-3">
              <Input
                name="microfrontend-access-level"
                type="radio"
                className="mr-2"
                checked={modificationSelection === BaseplateUserAccess.owner}
                onChange={(evt) =>
                  setModificationSelection(BaseplateUserAccess.owner)
                }
              />
              <span>Owner</span>
            </label>
            <label className="flex items-center mb-3">
              <Input
                name="microfrontend-access-level"
                type="radio"
                className="mr-2"
                checked={
                  modificationSelection === BaseplateUserAccess.collaborator
                }
                onChange={(evt) =>
                  setModificationSelection(BaseplateUserAccess.collaborator)
                }
              />
              <span>Collaborator</span>
            </label>
            <label className="flex items-center">
              <Input
                name="microfrontend-access-level"
                type="radio"
                className="mr-2"
                checked={modificationSelection === null}
                onChange={(evt) => setModificationSelection(null)}
              />
              <span>No Access</span>
            </label>
            <div className="flex justify-end mt-8">
              <Button
                type="button"
                kind={ButtonKind.secondary}
                onClick={cancelModify}
                className="mr-4"
              >
                Cancel
              </Button>
              <Button type="submit" kind={ButtonKind.primary}>
                Save
              </Button>
            </div>
          </form>
        </Modal>
      )} */}
    </>
  );
}

export type EntityWithAccessAndRoles = EntityWithAccess & {
  roles: BaseplateUserAccess[];
};

export interface EntityAccessProps {
  accessList: EntityWithAccessAndRoles[];
}

export enum BaseplateUserAccess {
  owner = "owner",
  collaborator = "collaborator",
  admin = "admin",
}
