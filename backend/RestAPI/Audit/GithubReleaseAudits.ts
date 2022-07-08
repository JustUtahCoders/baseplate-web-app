import dayjs from "dayjs";
import fs from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";
import {
  BaseplateCodeReleaseAuditItem,
  BaseplateReleasableProduct,
  AuditItemKind,
} from "./AuditTypes";

let baseplateCodeReleasePromise: Promise<BaseplateCodeReleaseAuditItem[]>;

export async function getBaseplateCodeReleaseAuditItems(): Promise<
  BaseplateCodeReleaseAuditItem[]
> {
  if (!baseplateCodeReleasePromise && process.env.IS_RUNNING_LOCALLY) {
    try {
      const cachedData = JSON.parse(
        await fs.readFile(
          fileURLToPath(
            new URL("./GithubReleasesCache.json", import.meta.url).href
          ),
          "utf-8"
        )
      );
      if (dayjs().diff(cachedData.timestamp, "hour") < 24) {
        baseplateCodeReleasePromise = Promise.resolve(cachedData.data);
      }
    } catch {}
  }

  if (!baseplateCodeReleasePromise) {
    baseplateCodeReleasePromise = Promise.all([
      getGithubReleases("baseplate-web-app", BaseplateReleasableProduct.webApp),
      getGithubReleases("baseplate-cli", BaseplateReleasableProduct.cli),
      getGithubReleases(
        "baseplate-cloudflare-worker",
        BaseplateReleasableProduct.cloudflareWorker
      ),
    ]).then((values) => {
      const [webAppReleases, cliReleases, cloudflareWorkerReleases] = values;
      const result = webAppReleases
        .concat(cliReleases)
        .concat(cloudflareWorkerReleases)
        .sort((first, second) => {
          const firstRelease = dayjs(first.auditTimestamp);
          if (firstRelease.isBefore(second.auditTimestamp)) {
            return -1;
          } else if (firstRelease.isAfter(second.auditTimestamp)) {
            return 1;
          } else {
            return 0;
          }
        });

      // Avoid Github rate limits during local dev
      if (process.env.IS_RUNNING_LOCALLY) {
        fs.writeFile(
          fileURLToPath(
            new URL("./GithubReleasesCache.json", import.meta.url).href
          ),
          JSON.stringify({
            timestamp: Date.now(),
            data: result,
          }),
          "utf-8"
        );
      }

      return result;
    });
  }

  return baseplateCodeReleasePromise;
}

async function getGithubReleases(
  repoName: string,
  releasableProduct: BaseplateReleasableProduct
): Promise<BaseplateCodeReleaseAuditItem[]> {
  const r = await fetch(
    `https://api.github.com/repos/JustUtahCoders/${repoName}/actions/runs\?event=release`
  );
  if (r.ok) {
    const json = await r.json();
    return json.workflow_runs.map((workflow_run) => {
      const result: BaseplateCodeReleaseAuditItem = {
        id: String(workflow_run.id).toString(),
        kind: AuditItemKind.baseplateRelease,
        auditTimestamp: dayjs(workflow_run.updated_at).toDate(),
        releasedProduct: releasableProduct,
        releaseNotesUrl: `https://github.com/JustUtahCoders/${repoName}/releases/tag/${workflow_run.head_branch}`,
        releaseTag: workflow_run.head_branch,
      };

      return result;
    });
  } else {
    throw Error(`Unable to retrieve workflow audit for repo ${repoName}`);
  }
}
