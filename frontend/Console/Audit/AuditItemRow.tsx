import { isBoolean } from "@reach/utils";
import { always } from "kremling";
import { isEmpty, isEqual, isNull, isString, isUndefined } from "lodash-es";
import { ReactNode } from "react";
import { Microfrontend } from "../../../backend/DB/Models/Microfrontend/Microfrontend";
import {
  AuditItem,
  AuditItemKind,
  BaseplateCodeReleaseAuditItem,
  BaseplateDBAuditItem,
  BaseplateReleasableProduct,
  DeploymentAuditItem,
} from "../../../backend/RestAPI/Audit/AuditTypes";
import { Anchor } from "../../Styleguide/Anchor";
import { ButtonKind } from "../../Styleguide/Button";
import { unmistakablyIntelligibleDateFormat } from "../../Utils/dayjsUtils";
import {
  useConsoleParams,
  useMicrofrontendParams,
} from "../../Utils/paramHelpers";

const contentComponents = {
  [AuditItemKind.baseplateRelease]: BaseplateReleaseContent,
  [AuditItemKind.baseplateDB]: BaseplateDBContent,
  [AuditItemKind.deployment]: DeploymentContent,
};

export function AuditItemRow(props: AuditItemRowProps) {
  const ContentComponent = contentComponents[props.auditItem.kind];

  if (!ContentComponent) {
    throw Error(
      `AuditItemRow doesn't yet support '${props.auditItem.kind}' audit items`
    );
  }

  return (
    <div className="flex justify-between items-center border-b last:border-none border-gray-200 px-4 py-2">
      <ContentComponent auditItem={props.auditItem} />
      <div className="text-gray-400 text-xs">
        {unmistakablyIntelligibleDateFormat(
          props.auditItem.auditTimestamp,
          true
        )}
      </div>
    </div>
  );
}

function BaseplateReleaseContent(props: AuditItemRowProps) {
  const auditItem = props.auditItem as BaseplateCodeReleaseAuditItem;
  return (
    <div>
      <AuditItemIcon className="text-gray-400">B</AuditItemIcon>
      {releasedProductToReadableString()}{" "}
      <Anchor
        target="_blank"
        rel="noopener"
        kind={ButtonKind.classic}
        href={auditItem.releaseNotesUrl}
      >
        Version {auditItem.releaseTag}
      </Anchor>{" "}
      was released.
    </div>
  );

  function releasedProductToReadableString() {
    switch (auditItem.releasedProduct) {
      case BaseplateReleasableProduct.cli:
        return "Baseplate CLI";
      case BaseplateReleasableProduct.cloudflareWorker:
        return "Baseplate CDN";
      case BaseplateReleasableProduct.webApp:
        return "Baseplate Web App";
    }
  }
}

function DeploymentContent(props: AuditItemRowProps) {
  const { customerOrgId, microfrontendId } = useMicrofrontendParams();
  const auditItem = props.auditItem as DeploymentAuditItem;

  return (
    <div>
      <AuditItemIcon className="text-sky-400">D</AuditItemIcon>
      Microfrontend was{" "}
      <Anchor
        kind={ButtonKind.classic}
        to={`/console/${customerOrgId}/deployments/${auditItem.deploymentId}?microfrontendId=${microfrontendId}`}
      >
        deployed
      </Anchor>{" "}
      to{" "}
      <Anchor
        kind={ButtonKind.classic}
        to={`/console/${customerOrgId}/environments/${auditItem.environmentId}`}
      >
        {auditItem.environmentName} environment
      </Anchor>
      .
    </div>
  );
}

function BaseplateDBContent(props: AuditItemRowProps) {
  const auditItem = props.auditItem as BaseplateDBAuditItem<Microfrontend>;
  return (
    <div className="flex items-center">
      <AuditItemIcon className="text-lime-500">M</AuditItemIcon>
      <div>
        <div>Microfrontend was {dbItemDescription(auditItem)}.</div>
        <ul className="text-gray-400 text-xs">
          {auditDBChanges(auditItem.oldRowData, auditItem.newRowData).map(
            (change, i) => (
              <li key={i}>{change}</li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}

function dbItemDescription(auditItem: BaseplateDBAuditItem<Microfrontend>) {
  switch (auditItem.auditEventType) {
    case "INSERT":
      return "created";
    case "UPDATE":
      return "updated";
    case "DELETE":
      return "deleted";
    default:
      throw Error(
        `AuditItemRow doesn't yet support auditEventType '${auditItem.auditEventType}'`
      );
  }
}

function AuditItemIcon({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={always("text-lg mr-4").always(className!)}>
      {children}
    </span>
  );
}

function auditDBChanges(
  oldRow: object | null,
  newRow: object | null
): ReactNode[] {
  const changes: ReactNode[] = [];

  if (!oldRow || !newRow) {
    return changes;
  }

  const processedKeys = ["createdAt", "updatedAt"];

  for (let key in oldRow) {
    if (processedKeys.includes(key)) {
      continue;
    }

    if (!isEqual(oldRow[key], newRow[key])) {
      changes.push(renderAuditDBChange(key, oldRow[key], newRow[key]));
    }

    processedKeys.push(key);
  }

  for (let key in newRow) {
    if (processedKeys.includes(key)) {
      continue;
    }

    if (!isEqual(oldRow[key], newRow[key])) {
      changes.push(renderAuditDBChange(key, oldRow[key], newRow[key]));
    }
  }

  return changes;
}

function renderAuditDBChange(keyName, oldValue, newValue): ReactNode {
  return (
    <>
      <span className="text-amber-600">{keyName}</span> changed from{" "}
      {humanReadablePrimitive(oldValue)} to {humanReadablePrimitive(newValue)}.
    </>
  );
}

function humanReadablePrimitive(value: any): string {
  if (isString(value) && isEmpty(value)) {
    return "empty string";
  } else if (isNull(value) || isUndefined(value)) {
    return "null";
  } else if (isBoolean(value)) {
    return value ? "true" : "false";
  } else {
    return value;
  }
}

export interface AuditItemRowProps {
  auditItem: AuditItem;
}
