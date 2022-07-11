import { always } from "kremling";
import { capitalize, isEmpty } from "lodash-es";
import {
  ChangeEvent,
  FormEvent,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useOutletContext } from "react-router";
import { ShareableUserAttributes } from "../../backend/DB/Models/User/User";
import { MicrofrontendWithLastDeployed } from "../../backend/RestAPI/Microfrontends/GetMicrofrontends";
import { RootPropsContext } from "../App";
import { Button, ButtonKind, ButtonSize } from "./Button";
import { Input } from "./Input";
import { Modal } from "./Modal";
import Fuse from "fuse.js";
import { useMutation } from "react-query";
import { EndpointCreateDeploymentResBody } from "../../backend/TSEntry";
import { baseplateFetch } from "../Utils/baseplateFetch";
import { useMicrofrontendParams } from "../Utils/paramHelpers";

export function UserAccess(props: UserAccessProps) {
  const { microfrontend, refetchMicrofrontend } = useOutletContext<{
    microfrontend: MicrofrontendWithLastDeployed;
    refetchMicrofrontend(): void;
  }>();
  const { customerOrgId, microfrontendId } = useMicrofrontendParams();
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [checkedItems, setCheckedItems] = useState<UserWithAccess[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [usersBeingModified, setUsersBeingModified] = useState<
    UserWithAccess[]
  >([]);
  const rootProps = useContext(RootPropsContext);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredAccessList = useMemo(() => {
    if (isEmpty(searchTerm.trim())) {
      return props.accessList;
    } else {
      const fuse = new Fuse(props.accessList, {
        keys: ["user.givenName", "user.familyName", "user.email"],
      });
      const fuseResult = fuse.search<UserWithAccess>(searchTerm);
      return fuseResult.map((r) => r.item);
    }
  }, [props.accessList, searchTerm]);
  const selectAllIndeterminate =
    selectAllChecked && checkedItems.length !== filteredAccessList.length;
  const [modificationSelection, setModificationSelection] =
    useState<BaseplateUserAccess | null>(BaseplateUserAccess.owner);
  const submitMutation = useMutation<void, Error, FormEvent>(async (evt) => {
    evt.preventDefault();
    return baseplateFetch(
      `/api/orgs/${customerOrgId}/microfrontends/${microfrontendId}`,
      {
        method: "PATCH",
        body: {
          changedUserIds: usersBeingModified.map((u) => u.user.id),
          newAccess: modificationSelection,
        },
      }
    );
  });

  useEffect(() => {
    if (selectAllChecked) {
      setCheckedItems((items) =>
        items.filter((item) =>
          filteredAccessList.some(
            (userWithAccess) => userWithAccess.user.id === item.user.id
          )
        )
      );
    }
  }, [selectAllChecked, filteredAccessList]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectAllIndeterminate;
    }
  });

  return (
    <>
      <div className="flex justify-between items-center border-b border-gray-300 bg-gray-200 px-3.5 py-3 text-sm">
        <label className="flex items-center">
          <Input
            type="checkbox"
            className="mr-2"
            ref={selectAllRef}
            checked={selectAllChecked}
            onChange={handleSelectAllChange}
          />
          Select all
        </label>
        {checkedItems.length > 0 && (
          <div>
            {checkedItems.length.toLocaleString()} user
            {checkedItems.length === 1 ? "" : "s"} selected
          </div>
        )}
      </div>
      <div className="border-b border-gray-300 px-3.5 py-3">
        <Input
          type="text"
          placeholder="Find a user..."
          inputSize="medium"
          className="w-full text-sm"
          value={searchTerm}
          onChange={(evt) => setSearchTerm(evt.target.value)}
        />
      </div>
      {filteredAccessList.map((userWithAccess, i) => {
        // Could make this more efficient in the future. Currently is O(n^2)
        const isChecked = checkedItems.some(
          (i) => i.user.id === userWithAccess.user.id
        );
        const isCurrentUser =
          userWithAccess.user.id ===
          rootProps?.userInformation.userPreferences?.userId;

        return (
          <div
            key={userWithAccess.user.id}
            className={always(
              "flex justify-between items-center px-3.5 py-3 border-b border-gray-300"
            ).maybe(
              "border-b border-gray-400",
              i < filteredAccessList.length - 1
            )}
          >
            <label className="flex items-center text-sm">
              <Input
                name="microfrontend-access-row"
                type="checkbox"
                className="mr-2"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              <div>
                <div>
                  {userWithAccess.user.givenName}{" "}
                  {userWithAccess.user.familyName}
                  {isCurrentUser && <span className="text-xs"> (you)</span>}
                </div>
                <div className="text-gray-600 text-xs">
                  {userWithAccess.user.email}
                  {userWithAccess.access.map((access) => (
                    <Fragment key={access}>
                      <span> • </span>
                      <span className="text-amber-500">
                        {capitalize(access)}
                      </span>
                    </Fragment>
                  ))}
                </div>
              </div>
            </label>
            {!isCurrentUser &&
              !userWithAccess.access.includes(BaseplateUserAccess.admin) && (
                <Button
                  type="button"
                  kind={ButtonKind.transparent}
                  className="text-gray-500 hover:bg-gray-200 rounded hover:text-red-600 px-2 py-1 text-xs"
                  onClick={() => modifyUserAccess(userWithAccess)}
                >
                  Modify
                </Button>
              )}
          </div>
        );

        function handleCheckboxChange(evt: ChangeEvent<HTMLInputElement>) {
          if (evt.target.checked) {
            setCheckedItems((items) => [...items, userWithAccess]);
          } else {
            setCheckedItems((items) =>
              items.filter((i) => i.user.id !== userWithAccess.user.id)
            );
          }
        }
      })}
      {usersBeingModified.length > 0 && (
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
      )}
    </>
  );

  function cancelModify() {
    setUsersBeingModified([]);
  }

  function modifyUserAccess(userWithAccess: UserWithAccess) {
    const isOwner = userWithAccess.access.includes(
      BaseplateUserAccess.collaborator
    );
    setModificationSelection(
      isOwner ? BaseplateUserAccess.owner : BaseplateUserAccess.collaborator
    );
    setUsersBeingModified([userWithAccess]);
  }

  function handleSelectAllChange(evt: ChangeEvent<HTMLInputElement>) {
    if (evt.target.checked) {
      setSelectAllChecked(true);
      setCheckedItems(filteredAccessList);
    } else {
      setSelectAllChecked(false);
      setCheckedItems([]);
    }
  }
}

export interface UserAccessProps {
  accessList: UserWithAccess[];
}

export enum BaseplateUserAccess {
  owner = "owner",
  collaborator = "collaborator",
  admin = "admin",
}

export interface UserWithAccess {
  user: ShareableUserAttributes;
  access: BaseplateUserAccess[];
}
