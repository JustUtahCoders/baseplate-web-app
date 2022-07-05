import { AuditAttributes } from "../../DB/Models/Audit/Audit";
import { Deployment } from "../../DB/Models/Deployment/Deployment";
import { Environment } from "../../DB/Models/Environment/Environment";

export enum AuditItemKind {
  baseplateRelease = "baseplateRelease",
  baseplateDB = "baseplateDB",
  deployment = "deployment",
}

interface BaseAuditItem {
  id: string;
  kind: AuditItemKind;
  auditTimestamp: Date;
}

export enum BaseplateReleasableProduct {
  webApp = "webApp",
  cloudflareWorker = "cloudflareWorker",
  cli = "cli",
}

export interface BaseplateCodeReleaseAuditItem extends BaseAuditItem {
  kind: AuditItemKind.baseplateRelease;
  releasedProduct: BaseplateReleasableProduct;
  releaseNotesUrl: string;
  releaseTag: string;
}

export interface BaseplateDBAuditItem<AuditedObject>
  extends BaseAuditItem,
    AuditAttributes<AuditedObject> {
  kind: AuditItemKind.baseplateDB;
  modelName: string;
}

export interface DeploymentAuditItem extends BaseAuditItem {
  kind: AuditItemKind.deployment;
  deploymentId: Deployment["id"];
  environmentId: Environment["id"];
  environmentName: Environment["name"];
}

export type AuditItem<AuditedObject = void> =
  | BaseplateCodeReleaseAuditItem
  | BaseplateDBAuditItem<AuditedObject>
  | DeploymentAuditItem;
