import { useMutation, useQuery, UseQueryResult } from "react-query";
import { useOutletContext, useParams } from "react-router";
import { BaseplateUUID } from "../../../backend/DB/Models/SequelizeTSHelpers";
import { Loader } from "../../Styleguide/Loader";
import { ErrorLoading } from "../../Styleguide/ErrorLoading";
import { baseplateFetch } from "../../Utils/baseplateFetch";
import { EndpointGetMicrofrontendActiveResBody } from "../../../backend/RestAPI/Microfrontends/MicrofrontendStatuses";
import { Card, CardHeader } from "../../Styleguide/Card";
import { ConfigurationTable } from "../../Styleguide/ConfigurationTable";
import { FormEvent, useContext, useEffect, useState } from "react";
import { RootPropsContext } from "../../App";
import { Modal } from "../../Styleguide/Modal";
import { MicrofrontendWithLastDeployed } from "../../../backend/RestAPI/Microfrontends/GetMicrofrontends";
import { EndpointGetLatestMicrofrontendDeploymentsResBody } from "../../../backend/RestAPI/Microfrontends/LatestMicrofrontendDeployments";
import { useCustomerOrgId } from "../../Utils/useCustomerOrgId";
import { Button, ButtonKind } from "../../Styleguide/Button";
import { Microfrontend } from "../../../backend/DB/Models/Microfrontend/Microfrontend";
import { FormField } from "../../Styleguide/FormField";
import { FormFieldLabel } from "../../Styleguide/FormFieldLabel";
import { Input } from "../../Styleguide/Input";

export function MicrofrontendConfiguration() {
  const { customerOrgId, microfrontendId } = useParams<{
    customerOrgId: BaseplateUUID;
    microfrontendId: BaseplateUUID;
  }>();
  const { microfrontend, refetchMicrofrontend } = useOutletContext<{
    microfrontend: MicrofrontendWithLastDeployed;
    refetchMicrofrontend(): void;
  }>();
  const rootProps = useContext(RootPropsContext);
  const activeQuery = useMicrofrontendActiveQuery();
  const [fieldToEdit, setFieldToEdit] = useState<EditableField | null>(null);

  const hasScope =
    microfrontend.useCustomerOrgKeyAsScope || microfrontend.scope;
  const isActive = activeQuery.data?.isActive;
  const scope = hasScope
    ? microfrontend.useCustomerOrgKeyAsScope
      ? rootProps.userInformation.orgKey
      : microfrontend.scope
    : null;
  const importSpecifier = scope
    ? `@${scope}/${microfrontend.name}`
    : microfrontend.name;

  if (activeQuery.isLoading) {
    return (
      <Loader
        description={`Loading ${microfrontend.name} microfrontend activity`}
      />
    );
  }

  if (activeQuery.error) {
    return (
      <ErrorLoading
        thingBeingLoaded={`${microfrontend.name} microfrontend activity`}
      />
    );
  }

  const EditComponent = fieldToEdit && editComponents[fieldToEdit];
  const aliases = ["@convex/settings", "@convex/user-settings"];

  return (
    <Card
      header={
        <CardHeader>
          <h2 className="text-lg">Configure {microfrontend.name}</h2>
        </CardHeader>
      }
    >
      <ConfigurationTable
        sections={[
          {
            label: "Import Specifier",
            items: [
              {
                label: "Specifier",
                element: importSpecifier,
                editable: true,
                handleEdit() {
                  setFieldToEdit(EditableField.specifier);
                },
              },
              {
                label: "Name",
                element: microfrontend.name,
              },
              {
                label: "Scope",
                items: [
                  {
                    label: "Default Organization Scope",
                    element: rootProps.userInformation.orgKey,
                  },
                  {
                    label: "Use Scope",
                    element: hasScope ? "Yes" : "No",
                  },
                  {
                    label: "Use Organization Scope",
                    element: microfrontend.useCustomerOrgKeyAsScope
                      ? "Yes"
                      : "No",
                  },
                  {
                    label: "Custom Scope",
                    element: microfrontend.scope || "\u2014",
                  },
                ],
              },
              {
                label: "Aliases",
                element:
                  aliases.length > 0
                    ? "\u2014"
                    : aliases.map((alias) => <div>{alias}</div>),
                editable: true,
                handleEdit() {
                  setFieldToEdit(EditableField.aliases);
                },
              },
            ],
          },
        ]}
      />
      {EditComponent && (
        <Modal title={`Edit microfrontend ${fieldToEdit}`} close={cancelEdit}>
          <EditComponent microfrontend={microfrontend} close={cancelEdit} />
        </Modal>
      )}
    </Card>
  );

  function cancelEdit() {
    refetchMicrofrontend();
    setFieldToEdit(null);
  }
}

export function useLastMicrofrontendDeployments(
  microfrontendId: BaseplateUUID
): UseQueryResult<EndpointGetLatestMicrofrontendDeploymentsResBody> {
  const customerOrgId = useCustomerOrgId();
  return useQuery<
    unknown,
    Error,
    EndpointGetLatestMicrofrontendDeploymentsResBody
  >(`last-microfrontend-deployments-${microfrontendId}`, async () => {
    return baseplateFetch<EndpointGetLatestMicrofrontendDeploymentsResBody>(
      `/api/orgs/${customerOrgId}/microfrontends/${microfrontendId}/latest-deployments`
    );
  });
}

function EditName({ microfrontend, close }: EditProps) {
  const { customerOrgId, microfrontendId } = useParams<{
    customerOrgId: string;
    microfrontendId: string;
  }>();
  const submitMutation = useMutation<
    Microfrontend,
    Error,
    FormEvent<HTMLFormElement>
  >((evt) => {
    evt.preventDefault();
    return baseplateFetch<Microfrontend>(
      `/api/orgs/${customerOrgId}/microfrontends/${microfrontendId}`,
      {
        method: "PATCH",
        body: {
          ...microfrontend,
          name,
        },
      }
    );
  });

  useEffect(() => {
    if (submitMutation.isSuccess) {
      close();
    }
  });

  return (
    <form onSubmit={submitMutation.mutate}>
      <div className="flex justify-end">
        <Button
          type="button"
          kind={ButtonKind.secondary}
          onClick={close}
          className="mr-4"
        >
          Cancel
        </Button>
        <Button type="submit" kind={ButtonKind.primary}>
          Save
        </Button>
      </div>
    </form>
  );
}

function EditScope({ microfrontend, close }: EditProps) {
  const { customerOrgId, microfrontendId } = useParams<{
    customerOrgId: string;
    microfrontendId: string;
  }>();
  const rootProps = useContext(RootPropsContext);
  const [name, setName] = useState(microfrontend.name);
  const [selection, setSelection] = useState(() => {
    if (microfrontend.useCustomerOrgKeyAsScope) {
      return "useCustomerOrgKeyAsScope";
    } else if (microfrontend.scope) {
      return "customScope";
    } else {
      return "noScope";
    }
  });
  const [customScope, setCustomScope] = useState(microfrontend.scope ?? "");

  const submitMutation = useMutation<
    Microfrontend,
    Error,
    FormEvent<HTMLFormElement>
  >((evt) => {
    evt.preventDefault();
    let patch: Partial<Microfrontend>;
    if (selection === "useCustomerOrgKeyAsScope") {
      patch = {
        useCustomerOrgKeyAsScope: true,
        scope: null,
      };
    } else if (selection === "noScope") {
      patch = {
        useCustomerOrgKeyAsScope: false,
        scope: null,
      };
    } else {
      patch = {
        useCustomerOrgKeyAsScope: false,
        scope: customScope,
      };
    }

    if (name !== microfrontend.name) {
      patch.name = name;
    }

    return baseplateFetch<Microfrontend>(
      `/api/orgs/${customerOrgId}/microfrontends/${microfrontendId}`,
      {
        method: "PATCH",
        body: patch,
      }
    );
  });

  useEffect(() => {
    if (submitMutation.isSuccess) {
      close();
    }
  });

  let scope: string | null = null;

  if (selection === "useCustomerOrgKeyAsScope") {
    scope = rootProps.userInformation.orgKey as string;
  } else if (selection === "customScope") {
    scope = customScope;
  }

  const importSpecifier = scope ? `@${scope}/${name}` : name;

  return (
    <form onSubmit={submitMutation.mutate}>
      <FormField>
        <FormFieldLabel>Import Specifier</FormFieldLabel>
        <div className="text-sm text-gray-600">{importSpecifier}</div>
      </FormField>
      <FormField className="my-4">
        <FormFieldLabel htmlFor="microfrontend-name">
          Microfrontend name
        </FormFieldLabel>
        <Input
          autoFocus
          id="microfrontend-name"
          type="text"
          value={name}
          onChange={(evt) => setName(evt.target.value)}
          placeholder={microfrontend.name}
        />
      </FormField>
      <fieldset>
        <legend className="text-gray-800 text-sm">Scope</legend>
        <FormField className="mt-1">
          <div className="flex items-center">
            <Input
              id="org-key-as-scope"
              type="radio"
              name="import-specifier-scope"
              checked={selection === "useCustomerOrgKeyAsScope"}
              onChange={(evt) => setSelection("useCustomerOrgKeyAsScope")}
            />
            <FormFieldLabel
              className="ml-4"
              htmlFor="org-key-as-scope"
              orientation="horizontal"
            >
              Organization Key as scope
            </FormFieldLabel>
          </div>
          <div className="flex items-center">
            <Input
              id="custom-scope"
              type="radio"
              name="import-specifier-scope"
              checked={selection === "customScope"}
              onChange={(evt) => setSelection("customScope")}
            />
            <FormFieldLabel
              className="ml-4"
              htmlFor="custom-scope"
              orientation="horizontal"
            >
              Custom scope
            </FormFieldLabel>
          </div>
          <div className="flex items-center">
            <Input
              id="no-scope"
              type="radio"
              name="import-specifier-scope"
              checked={selection === "noScope"}
              onChange={(evt) => setSelection("noScope")}
            />
            <FormFieldLabel
              className="ml-4"
              htmlFor="no-scope"
              orientation="horizontal"
            >
              No scope
            </FormFieldLabel>
          </div>
        </FormField>
      </fieldset>
      {selection === "customScope" && (
        <FormField className="mt-4">
          <FormFieldLabel htmlFor="custom-scope-text">
            Custom scope
          </FormFieldLabel>
          <Input
            required
            id="custom-scope-text"
            type="text"
            value={customScope}
            onChange={(evt) => setCustomScope(evt.target.value)}
          />
        </FormField>
      )}
      <div className="flex justify-end mt-8">
        <Button
          type="button"
          kind={ButtonKind.secondary}
          onClick={close}
          className="mr-4"
        >
          Cancel
        </Button>
        <Button type="submit" kind={ButtonKind.primary}>
          Save
        </Button>
      </div>
    </form>
  );
}

export function useMicrofrontendActiveQuery(): UseQueryResult<
  EndpointGetMicrofrontendActiveResBody,
  Error
> {
  const { customerOrgId, microfrontendId } = useParams<{
    customerOrgId: string;
    microfrontendId: string;
  }>();

  return useQuery<unknown, Error, EndpointGetMicrofrontendActiveResBody>(
    `microfrontend-statuses-${customerOrgId}-${microfrontendId}`,
    async () =>
      baseplateFetch(
        `/api/orgs/${customerOrgId}/microfrontends/${microfrontendId}/statuses`
      )
  );
}

function EditAliases() {
  return <div>Hi</div>;
}

interface EditProps {
  microfrontend: Microfrontend;
  close(): any;
}

enum EditableField {
  specifier = "specifier",
  aliases = "aliases",
}

const editComponents = {
  [EditableField.specifier]: EditScope,
  [EditableField.aliases]: EditAliases,
};
