import { useMutation, useQuery, UseQueryResult } from "react-query";
import { useOutletContext } from "react-router";
import { BaseplateUUID } from "../../../backend/DB/Models/SequelizeTSHelpers";
import { baseplateFetch } from "../../Utils/baseplateFetch";
import { EndpointGetMicrofrontendActiveResBody } from "../../../backend/RestAPI/Microfrontends/MicrofrontendStatuses";
import { Card, CardHeader } from "../../Styleguide/Card";
import { ConfigurationTable } from "../../Styleguide/ConfigurationTable";
import { FormEvent, useContext, useEffect, useRef, useState } from "react";
import { RootPropsContext } from "../../App";
import { Modal } from "../../Styleguide/Modal";
import { MicrofrontendWithLastDeployed } from "../../../backend/RestAPI/Microfrontends/GetMicrofrontends";
import { EndpointGetLatestMicrofrontendDeploymentsResBody } from "../../../backend/RestAPI/Microfrontends/LatestMicrofrontendDeployments";
import {
  useConsoleParams,
  useMicrofrontendParams,
} from "../../Utils/paramHelpers";
import { Button, ButtonKind } from "../../Styleguide/Button";
import { Microfrontend } from "../../../backend/DB/Models/Microfrontend/Microfrontend";
import { FormField } from "../../Styleguide/FormField";
import { FormFieldLabel } from "../../Styleguide/FormFieldLabel";
import { Input } from "../../Styleguide/Input";
import { isEmpty } from "lodash-es";

export function MicrofrontendConfiguration() {
  const { microfrontend, refetchMicrofrontend } = useOutletContext<{
    microfrontend: MicrofrontendWithLastDeployed;
    refetchMicrofrontend(): void;
  }>();
  const rootProps = useContext(RootPropsContext);
  const [fieldToEdit, setFieldToEdit] = useState<EditableField | null>(null);

  const hasScope =
    microfrontend.useCustomerOrgKeyAsScope || microfrontend.scope;
  const scope = hasScope
    ? microfrontend.useCustomerOrgKeyAsScope
      ? rootProps.userInformation.orgKey
      : microfrontend.scope
    : null;
  const importSpecifier = scope
    ? `@${scope}/${microfrontend.name}`
    : microfrontend.name;

  const EditComponent = fieldToEdit && editComponents[fieldToEdit];
  const aliases: string[] = [
    microfrontend.alias1,
    microfrontend.alias2,
    microfrontend.alias3,
  ].filter(Boolean) as string[];

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
                  aliases.length === 0
                    ? "\u2014"
                    : aliases.map((alias) => <div key={alias}>{alias}</div>),
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
  const { customerOrgId } = useConsoleParams();
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

function EditSpecifier({ microfrontend, close }: EditProps) {
  const { customerOrgId, microfrontendId } = useMicrofrontendParams();
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
        scope: "",
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
      <p className="text-xs mb-4 text-gray-600">
        The import specifier is the name of the microfrontend used in your code
        when importing the microfrontend.
      </p>
      <FormField>
        <span className="text-gray-800 text-sm mb-1">Import Specifier</span>
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

function EditAliases({ microfrontend, close }) {
  const { customerOrgId, microfrontendId } = useMicrofrontendParams();
  const [alias1, setAlias1] = useState(microfrontend.alias1 ?? "");
  const [alias2, setAlias2] = useState(microfrontend.alias2 ?? "");
  const [alias3, setAlias3] = useState(microfrontend.alias3 ?? "");
  const alias1Ref = useRef<HTMLInputElement>(null);
  const alias2Ref = useRef<HTMLInputElement>(null);
  const alias3Ref = useRef<HTMLInputElement>(null);

  const submitMutation = useMutation<
    Microfrontend,
    Error,
    FormEvent<HTMLFormElement>
  >((evt) => {
    evt.preventDefault();
    let patch: Partial<Microfrontend> = {
      alias1: alias1 || null,
      alias2: alias2 || null,
      alias3: alias3 || null,
    };

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

  return (
    <form onSubmit={submitMutation.mutate}>
      <p className="text-xs mb-4 text-gray-600">
        Aliases are alternate import specifiers for this microfrontend that
        appear in the import map. They can help you slowly migrate your code to
        use a new name for the microfrontend.
      </p>
      <FormField className="relative">
        <FormFieldLabel htmlFor="alias1">Alias 1</FormFieldLabel>
        <Input
          ref={alias1Ref}
          type="text"
          value={alias1}
          onChange={(evt) => setAlias1(evt.target.value)}
          placeholder="@org/navbar"
        />
        {!isEmpty(alias1) && (
          <Button
            type="button"
            onClick={clearAlias1}
            kind={ButtonKind.transparent}
            className="absolute right-2 top-1/2"
          >
            {"\u24e7"}
          </Button>
        )}
      </FormField>
      <FormField className="mt-4 relative">
        <FormFieldLabel htmlFor="alias2">Alias 2</FormFieldLabel>
        <Input
          ref={alias2Ref}
          type="text"
          value={alias2}
          onChange={(evt) => setAlias2(evt.target.value)}
          placeholder="@org/navbar"
        />
        {!isEmpty(alias2) && (
          <Button
            type="button"
            onClick={clearAlias2}
            kind={ButtonKind.transparent}
            className="absolute right-2 top-1/2"
          >
            {"\u24e7"}
          </Button>
        )}
      </FormField>
      <FormField className="mt-4 relative">
        <FormFieldLabel htmlFor="alias3">Alias 3</FormFieldLabel>
        <Input
          ref={alias3Ref}
          type="text"
          value={alias3}
          onChange={(evt) => setAlias3(evt.target.value)}
          placeholder="@org/navbar"
        />
        {!isEmpty(alias3) && (
          <Button
            type="button"
            onClick={clearAlias3}
            kind={ButtonKind.transparent}
            className="absolute right-2 top-1/2"
          >
            {"\u24e7"}
          </Button>
        )}
      </FormField>
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

  function clearAlias1() {
    setAlias1("");
    alias1Ref.current?.focus();
  }

  function clearAlias2() {
    setAlias2("");
    alias2Ref.current?.focus();
  }

  function clearAlias3() {
    setAlias3("");
    alias3Ref.current?.focus();
  }
}

export function useMicrofrontendActiveQuery(): UseQueryResult<
  EndpointGetMicrofrontendActiveResBody,
  Error
> {
  const { customerOrgId, microfrontendId } = useMicrofrontendParams();

  return useQuery<unknown, Error, EndpointGetMicrofrontendActiveResBody>(
    `microfrontend-statuses-${customerOrgId}-${microfrontendId}`,
    async () =>
      baseplateFetch(
        `/api/orgs/${customerOrgId}/microfrontends/${microfrontendId}/statuses`
      )
  );
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
  [EditableField.specifier]: EditSpecifier,
  [EditableField.aliases]: EditAliases,
};
