import { mergeDefaultOrgSettings, OrgSettings } from "@baseplate-sdk/utils";
import dayjs from "dayjs";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { CustomerOrg } from "../../../backend/DB/Models/CustomerOrg/CustomerOrg";
import { EndpointGetStaticWebSettingsResBody } from "../../../backend/TSEntry";
import { Button, ButtonKind } from "../../Styleguide/Button";
import { Card, CardFooter, CardHeader } from "../../Styleguide/Card";
import { ConfigurationTable } from "../../Styleguide/ConfigurationTable";
import { FormField } from "../../Styleguide/FormField";
import { FormFieldLabel } from "../../Styleguide/FormFieldLabel";
import { Input } from "../../Styleguide/Input";
import { Modal } from "../../Styleguide/Modal";
import { baseplateFetch } from "../../Utils/baseplateFetch";
import { unmistakablyIntelligibleDateFormat } from "../../Utils/dayjsUtils";
import { useCustomerOrg } from "../ConsoleNavOrgSelect";

const EditComponents = {
  name: EditOrgName,
  orgKey: EditOrgKey,
  importMapCacheControl: EditImportMapCacheControl,
  staticFilesCacheControl: EditStaticFilesCacheControl,
  corsAllowCredentials: EditCorsCredentials,
  corsMaxAge: EditCorsMaxAge,
  corsAllowMethods: EditCorsMethods,
};

export function OrgSettingsConfiguration() {
  const { selectedCustomerOrg } = useCustomerOrg();
  const [fieldToEdit, setFieldToEdit] = useState<string | null>(null);
  const [editSubmit, setEditSubmit] = useState<boolean>(false);
  const EditComponent = EditComponents[fieldToEdit ?? ""];
  if (EditComponent && !EditComponent.displayName) {
    throw Error(
      `Please implement displayName for Component ${EditComponent.name}`
    );
  }
  const queryClient = useQueryClient();

  const staticWebSettingsQuery = useQuery<unknown, Error, OrgSettings>(
    `static-web-settings-${selectedCustomerOrg!.id}`,
    async () => {
      return baseplateFetch<EndpointGetStaticWebSettingsResBody>(
        `/api/orgs/${selectedCustomerOrg!.id}/static-web-settings`
      );
    }
  );

  const staticWebSettings = mergeDefaultOrgSettings(
    staticWebSettingsQuery.data || {}
  );

  const numBaseplateHostingEnvs = Object.values(
    staticWebSettings.staticFiles.microfrontendProxy.environments
  ).filter((proxySetting) => proxySetting.useBaseplateHosting).length;
  const totalNumEnvs = Object.keys(
    staticWebSettings.staticFiles.microfrontendProxy.environments
  ).length;
  let baseplateHostingDescription: string;
  if (totalNumEnvs === 0) {
    baseplateHostingDescription = "\u2014";
  } else if (numBaseplateHostingEnvs === totalNumEnvs) {
    baseplateHostingDescription = "Always";
  } else if (numBaseplateHostingEnvs > 0) {
    baseplateHostingDescription = "Sometimes";
  } else {
    baseplateHostingDescription = "Never";
  }

  return (
    <>
      <Card
        header={
          <CardHeader>
            <h2 className="text-lg">Configure Organization</h2>
          </CardHeader>
        }
      >
        <ConfigurationTable
          sections={[
            {
              label: "Core settings",
              items: [
                {
                  label: "ID",
                  element: (
                    <span className="text-xs">{selectedCustomerOrg!.id}</span>
                  ),
                },
                {
                  label: "Name",
                  element: selectedCustomerOrg!.name,
                  editable: true,
                  handleEdit() {
                    setFieldToEdit("name");
                  },
                },
                {
                  label: "Org Key",
                  element: selectedCustomerOrg!.orgKey,
                  editable: true,
                  handleEdit() {
                    setFieldToEdit("orgKey");
                  },
                },
                {
                  label: "Created At",
                  element: unmistakablyIntelligibleDateFormat(
                    selectedCustomerOrg!.createdAt
                  ),
                },
                {
                  label: "Updated At",
                  element: unmistakablyIntelligibleDateFormat(
                    selectedCustomerOrg!.updatedAt
                  ),
                },
              ],
            },
            {
              label: "Web settings",
              items: [
                {
                  label: "CORS",
                  items: [
                    {
                      label: "Allowed Origins",
                      element: mdashEmptyString(
                        staticWebSettings.cors.allowOrigins
                          .map((origin) =>
                            origin === "*" ? "* (All)" : origin
                          )
                          .join(", ")
                      ),
                    },
                    {
                      label: "Expose Headers",
                      element: mdashEmptyString(
                        staticWebSettings.cors.exposeHeaders.join(", ")
                      ),
                    },
                    {
                      label: "Max Age",
                      element: `${staticWebSettings.cors.maxAge.toLocaleString()} seconds (${dayjs()
                        .subtract(staticWebSettings.cors.maxAge, "second")
                        .fromNow(true)})`,
                      editable: true,
                      handleEdit() {
                        setFieldToEdit("corsMaxAge");
                      },
                    },
                    {
                      label: "Allow Credentials",
                      element: mdashEmptyString(
                        staticWebSettings.cors.allowCredentials ? "Yes" : "No"
                      ),
                      editable: true,
                      handleEdit() {
                        setFieldToEdit("corsAllowCredentials");
                      },
                    },
                    {
                      label: "Allow Methods",
                      element: mdashEmptyString(
                        staticWebSettings.cors.allowMethods.join(", ")
                      ),
                      editable: true,
                      handleEdit() {
                        setFieldToEdit("corsAllowMethods");
                      },
                    },
                    {
                      label: "Allow Headers",
                      element: mdashEmptyString(
                        staticWebSettings.cors.allowHeaders.join(", ")
                      ),
                    },
                  ],
                },
                {
                  label: "Import Map",
                  items: [
                    {
                      label: "Cache Control",
                      element: staticWebSettings.importMapCacheControl,
                      editable: true,
                      handleEdit() {
                        setFieldToEdit("importMapCacheControl");
                      },
                    },
                  ],
                },
                {
                  label: "Public Web Files",
                  items: [
                    {
                      label: "Use Baseplate S3 Storage",
                      element: baseplateHostingDescription,
                    },
                    {
                      label: "Cache Control",
                      element: mdashEmptyString(
                        staticWebSettings.staticFiles.cacheControl
                      ),
                      editable: true,
                      handleEdit() {
                        setFieldToEdit("staticFilesCacheControl");
                      },
                    },
                  ],
                },
              ],
            },
          ]}
        />
      </Card>
      {EditComponent && (
        <Modal close={closeEdit} title={`Edit ${EditComponent.displayName}`}>
          <form onSubmit={handleEditSubmit}>
            <EditComponent
              customerOrg={selectedCustomerOrg!}
              staticWebSettings={staticWebSettings}
              shouldSubmit={editSubmit}
              close={closeEdit}
            />
            <div className="flex justify-end mt-8">
              <Button
                type="button"
                kind={ButtonKind.secondary}
                onClick={closeEdit}
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

  function closeEdit(wasEdited?: boolean | any) {
    if (wasEdited === true) {
      queryClient.removeQueries(
        `static-web-settings-${selectedCustomerOrg!.id}`
      );
      queryClient.removeQueries(`user-customer-orgs`);
    }

    setFieldToEdit(null);
    setEditSubmit(false);
  }

  function handleEditSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setEditSubmit(true);
  }
}

function mdashEmptyString(str) {
  return str || "\u2014";
}

function EditOrgName(props: EditComponentProps) {
  const [orgName, setOrgName] = useState(props.customerOrg.name);

  useEditSubmit(props, (ac: AbortController) =>
    baseplateFetch(`/api/orgs/${props.customerOrg.id}`, {
      method: "PATCH",
      body: {
        name: orgName,
      },
      signal: ac.signal,
    })
  );

  return (
    <FormField>
      <FormFieldLabel htmlFor="org-name">Organization name</FormFieldLabel>
      <Input
        id="org-name"
        type="text"
        value={orgName}
        onChange={(evt) => setOrgName(evt.target.value)}
      />
    </FormField>
  );
}
EditOrgName.displayName = "Organization Name";

function EditOrgKey(props: EditComponentProps) {
  const [orgKey, setOrgKey] = useState(props.customerOrg.orgKey);

  useEditSubmit(props, (ac: AbortController) =>
    baseplateFetch(`/api/orgs/${props.customerOrg.id}`, {
      method: "PATCH",
      body: {
        orgKey,
      },
      signal: ac.signal,
    })
  );

  return (
    <FormField>
      <FormFieldLabel htmlFor="org-key">Organization key</FormFieldLabel>
      <Input
        id="org-key"
        type="text"
        value={orgKey}
        onChange={(evt) => setOrgKey(evt.target.value)}
      />
    </FormField>
  );
}
EditOrgKey.displayName = "Organization Key";

function EditImportMapCacheControl(props: EditComponentProps) {
  const [importMapCacheControl, setImportMapCacheControl] = useState(
    props.staticWebSettings.importMapCacheControl
  );

  useEditSubmit(props, (ac: AbortController) =>
    baseplateFetch(`/api/orgs/${props.customerOrg.id}/static-web-settings`, {
      method: "PATCH",
      body: {
        importMapCacheControl,
      },
      signal: ac.signal,
    })
  );

  return (
    <FormField>
      <FormFieldLabel htmlFor="org-import-map-cache-control">
        Import Map cache control
      </FormFieldLabel>
      <Input
        id="org-import-map-cache-control"
        type="text"
        value={importMapCacheControl}
        onChange={(evt) => setImportMapCacheControl(evt.target.value)}
      />
    </FormField>
  );
}
EditImportMapCacheControl.displayName = "Import Map";

function EditStaticFilesCacheControl(props: EditComponentProps) {
  const [staticFilesCacheControl, setStaticFilesCacheControl] = useState(
    props.staticWebSettings.staticFiles.cacheControl
  );

  useEditSubmit(props, (ac: AbortController) =>
    baseplateFetch(`/api/orgs/${props.customerOrg.id}/static-web-settings`, {
      method: "PATCH",
      body: {
        staticFiles: {
          cacheControl: staticFilesCacheControl,
        },
      },
      signal: ac.signal,
    })
  );

  return (
    <FormField>
      <FormFieldLabel htmlFor="org-static-files-cache-control">
        Static Files cache control
      </FormFieldLabel>
      <Input
        id="org-static-files-cache-control"
        type="text"
        value={staticFilesCacheControl}
        onChange={(evt) => setStaticFilesCacheControl(evt.target.value)}
      />
    </FormField>
  );
}
EditStaticFilesCacheControl.displayName = "Static Files";

function EditCorsCredentials(props: EditComponentProps) {
  const [corsAllowCredentials, setCorsAllowCredentials] = useState(
    props.staticWebSettings.cors.allowCredentials
  );

  useEditSubmit(props, (ac: AbortController) =>
    baseplateFetch(`/api/orgs/${props.customerOrg.id}/static-web-settings`, {
      method: "PATCH",
      body: {
        cors: {
          allowCredentials: corsAllowCredentials,
        },
      },
      signal: ac.signal,
    })
  );

  return (
    <FormField>
      <Input
        id="org-cors-credentials"
        type="checkbox"
        checked={corsAllowCredentials}
        onChange={(evt) => setCorsAllowCredentials(evt.target.checked)}
      />
      <FormFieldLabel htmlFor="org-cors-credentials">
        CORS Allow Credentials
      </FormFieldLabel>
    </FormField>
  );
}
EditCorsCredentials.displayName = "CORS";

function EditCorsMaxAge(props: EditComponentProps) {
  const [corsMaxAge, setCorsMaxAge] = useState(
    props.staticWebSettings.cors.maxAge
  );

  useEditSubmit(props, (ac: AbortController) =>
    baseplateFetch(`/api/orgs/${props.customerOrg.id}/static-web-settings`, {
      method: "PATCH",
      body: {
        cors: {
          maxAge: corsMaxAge,
        },
      },
      signal: ac.signal,
    })
  );

  return (
    <FormField>
      <FormFieldLabel htmlFor="org-cors-max-age">
        CORS Max Age (seconds)
      </FormFieldLabel>
      <Input
        id="org-cors-max-age"
        type="number"
        value={corsMaxAge}
        onChange={(evt) => setCorsMaxAge(Number(evt.target.value))}
      />
    </FormField>
  );
}
EditCorsMaxAge.displayName = "CORS";

function EditCorsMethods(props: EditComponentProps) {
  const [corsMethods, setCorsMethods] = useState(
    props.staticWebSettings.cors.allowMethods
  );

  useEditSubmit(props, (ac: AbortController) =>
    baseplateFetch(`/api/orgs/${props.customerOrg.id}/static-web-settings`, {
      method: "PATCH",
      body: {
        cors: {
          allowMethods: corsMethods,
        },
      },
      signal: ac.signal,
    })
  );

  return (
    <fieldset>
      <legend>CORS Allow Methods</legend>
      <div className="text-gray-600 text-xs my-1">(Recommended)</div>
      <FormField>
        <FormFieldLabel>
          <Input
            className="mr-2"
            name="GET"
            type="checkbox"
            checked={corsMethods.includes("GET")}
            onChange={toggleMethod}
          />
          GET
        </FormFieldLabel>
      </FormField>
      <FormField>
        <FormFieldLabel>
          <Input
            className="mr-2"
            name="HEAD"
            type="checkbox"
            checked={corsMethods.includes("HEAD")}
            onChange={toggleMethod}
          />
          HEAD
        </FormFieldLabel>
      </FormField>
      <div className="text-gray-600 text-xs mt-3 mb-1">(Not recommended)</div>
      <FormField>
        <FormFieldLabel>
          <Input
            className="mr-2"
            name="POST"
            type="checkbox"
            checked={corsMethods.includes("POST")}
            onChange={toggleMethod}
          />
          POST
        </FormFieldLabel>
      </FormField>
      <FormField>
        <FormFieldLabel>
          <Input
            className="mr-2"
            name="PUT"
            type="checkbox"
            checked={corsMethods.includes("PUT")}
            onChange={toggleMethod}
          />
          PUT
        </FormFieldLabel>
      </FormField>
      <FormField>
        <FormFieldLabel>
          <Input
            className="mr-2"
            name="DELETE"
            type="checkbox"
            checked={corsMethods.includes("DELETE")}
            onChange={toggleMethod}
          />
          DELETE
        </FormFieldLabel>
      </FormField>
      <FormField>
        <FormFieldLabel>
          <Input
            className="mr-2"
            name="PATCH"
            type="checkbox"
            checked={corsMethods.includes("PATCH")}
            onChange={toggleMethod}
          />
          PATCH
        </FormFieldLabel>
      </FormField>
    </fieldset>
  );

  function toggleMethod(evt: ChangeEvent<HTMLInputElement>) {
    if (corsMethods.includes(evt.target.name)) {
      setCorsMethods(corsMethods.filter((m) => m !== evt.target.name));
    } else {
      setCorsMethods(corsMethods.concat(evt.target.name));
    }
  }
}
EditCorsMethods.displayName = "CORS";

function useEditSubmit(
  props: EditComponentProps,
  submitter: (ac: AbortController) => Promise<any>
) {
  useEffect(() => {
    if (props.shouldSubmit) {
      const ac = new AbortController();

      submitter(ac).then(
        () => {
          props.close(true);
        },
        () => {
          console.error(
            "TODO: Implement better error handling for when org settings fail"
          );
        }
      );

      return () => {
        ac.abort();
      };
    }
  }, [props, props.shouldSubmit, submitter]);
}

interface EditComponentProps {
  customerOrg: CustomerOrg;
  staticWebSettings: OrgSettings;
  shouldSubmit: boolean;
  close: (wasEdited: boolean) => any;
}
