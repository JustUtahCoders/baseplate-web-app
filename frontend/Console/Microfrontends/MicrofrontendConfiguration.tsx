import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";
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
import { unmistakablyIntelligibleDateFormat } from "../../Utils/dayjsUtils";
import { Anchor } from "../../Styleguide/Anchor";
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
  const { microfrontend, rerender } = useOutletContext<{
    microfrontend: MicrofrontendWithLastDeployed;
    rerender(): void;
  }>();
  const queryClient = useQueryClient();
  const rootProps = useContext(RootPropsContext);
  const activeQuery = useQuery<
    unknown,
    Error,
    EndpointGetMicrofrontendActiveResBody
  >(`microfrontend-statuses-${customerOrgId}-${microfrontendId}`, async () =>
    baseplateFetch(
      `/api/orgs/${customerOrgId}/microfrontends/${microfrontendId}/statuses`
    )
  );
  const [fieldToEdit, setFieldToEdit] = useState<EditableField | null>(null);
  const latestDeploymentsQuery = useLastMicrofrontendDeployments(
    microfrontendId as string
  );

  const hasScope =
    microfrontend.useCustomerOrgKeyAsScope || microfrontend.scope;
  const isActive = activeQuery.data?.isActive && false;
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

  if (latestDeploymentsQuery.isLoading) {
    return (
      <Loader
        description={`Loading ${microfrontend.name} latest deployments`}
      />
    );
  }

  if (latestDeploymentsQuery.error) {
    return (
      <ErrorLoading
        thingBeingLoaded={`${microfrontend.name} latest deployments`}
      />
    );
  }

  const EditComponent = fieldToEdit && editComponents[fieldToEdit];

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
              },
              {
                label: "Name",
                element: microfrontend.name,
                editable: !isActive,
                handleEdit() {
                  setFieldToEdit(EditableField.name);
                },
              },
              {
                label: "Scope",
                items: [
                  {
                    label: "Default Organization Scope",
                    element: rootProps.userInformation.orgKey,
                    handleEdit() {
                      setFieldToEdit(EditableField.scope);
                    },
                  },
                  {
                    label: "Use Scope",
                    element: hasScope ? "Yes" : "No",
                    editable: !isActive,
                    handleEdit() {
                      setFieldToEdit(EditableField.scope);
                    },
                  },
                  {
                    label: "Use Organization Scope",
                    element: microfrontend.useCustomerOrgKeyAsScope
                      ? "Yes"
                      : "No",
                    editable: !isActive,
                    handleEdit() {
                      setFieldToEdit(EditableField.scope);
                    },
                  },
                  {
                    label: "Custom Scope",
                    element: microfrontend.scope || "\u2014",
                    editable: !isActive,
                    handleEdit() {
                      setFieldToEdit(EditableField.scope);
                    },
                  },
                ],
              },
            ],
          },
          {
            label: "Usage",
            items: [
              {
                label: "Active",
                element: !isActive ? "Yes" : "No",
              },
              {
                label: "Last Deployed",
                element: unmistakablyIntelligibleDateFormat(
                  microfrontend.deployedAt
                ),
              },
              {
                label: "Created",
                element: unmistakablyIntelligibleDateFormat(
                  microfrontend.createdAt
                ),
              },
              {
                label: "Updated",
                element: unmistakablyIntelligibleDateFormat(
                  microfrontend.updatedAt
                ),
              },
            ],
          },
          {
            label: "Environments",
            items:
              latestDeploymentsQuery.data!.latestEnvironmentDeployments.map(
                (latestDeploy) => ({
                  label: latestDeploy.environment.name,
                  items: [
                    {
                      label: "Entry URL",
                      element: latestDeploy.entryUrl ? (
                        <Anchor
                          rel="noopener"
                          target="_blank"
                          href={latestDeploy.entryUrl}
                          kind={ButtonKind.classic}
                        >
                          {latestDeploy.entryUrl}
                        </Anchor>
                      ) : (
                        "\u2014"
                      ),
                    },
                    {
                      label: "Latest Deployment",
                      element: unmistakablyIntelligibleDateFormat(
                        latestDeploy.latestDeployment
                      ),
                    },
                    {
                      label: "Total Deployments",
                      element: isNaN(latestDeploy.deploymentCount as number)
                        ? "0"
                        : (
                            latestDeploy.deploymentCount as number
                          ).toLocaleString(),
                    },
                  ],
                })
              ),
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
    queryClient.removeQueries(`microfrontends-${customerOrgId}`);
    rerender();
    setFieldToEdit(null);
  }
}

function useLastMicrofrontendDeployments(
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
  const [name, setName] = useState(microfrontend.name);
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
      <FormField className="mb-8">
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

  const importSpecifier = scope
    ? `@${scope}/${microfrontend.name}`
    : microfrontend.name;

  return (
    <form onSubmit={submitMutation.mutate}>
      <div>Import Specifier</div>
      <div className="text-sm">{importSpecifier}</div>
      <fieldset className="mt-8">
        <legend>Scope</legend>
        <FormField className="mt-4">
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
        <FormField className="mt-4 mb-8">
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

interface EditProps {
  microfrontend: Microfrontend;
  close(): any;
}

enum EditableField {
  name = "name",
  scope = "scope",
}

const editComponents = {
  [EditableField.name]: EditName,
  [EditableField.scope]: EditScope,
};
