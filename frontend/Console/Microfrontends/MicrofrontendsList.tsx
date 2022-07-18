import { useQuery } from "react-query";
import { EndpointGetMicrofrontendsResBody } from "../../../backend/TSEntry";
import { baseplateFetch } from "../../Utils/baseplateFetch";
import { useConsoleParams } from "../../Utils/paramHelpers";
import { Card, CardFooter } from "../../Styleguide/Card";
import { MainContent } from "../../Styleguide/MainContent";
import { useContext, useMemo, useState } from "react";
import { RootPropsContext } from "../../App";
import { Input } from "../../Styleguide/Input";
import { ButtonKind } from "../../Styleguide/Button";
import Fuse from "fuse.js";
import { Anchor } from "../../Styleguide/Anchor";
import { MicrofrontendWithLastDeployed } from "../../../backend/RestAPI/Microfrontends/GetMicrofrontends";
import {
  EndpointGetMicrofrontendsDownloadsResBody,
  MicrofrontendDownloads,
} from "../../../backend/RestAPI/Microfrontends/MicrofrontendDownloads";
import { maybe } from "kremling";
import { PageExplanation, PageHeader } from "../../Styleguide/PageHeader";
import dayjs from "dayjs";

export function MicrofrontendsList() {
  const [search, setSearch] = useState("");
  const { customerOrgId } = useConsoleParams();

  const mfeDownloads = useQuery<
    unknown,
    Error,
    EndpointGetMicrofrontendsDownloadsResBody
  >(`microfrontend-downloads-${customerOrgId}`, async function () {
    return baseplateFetch<EndpointGetMicrofrontendsDownloadsResBody>(
      `/api/orgs/${customerOrgId}/microfrontend-downloads`
    );
  });

  const microfrontends = useMicrofrontends();
  const filteredMicrofrontends = useMemo<
    MicrofrontendWithLastDeployed[]
  >(() => {
    if (search.trim() === "") {
      return microfrontends;
    } else {
      const fuse = new Fuse(microfrontends, {
        keys: ["name"],
      });
      const fuseResult = fuse.search<MicrofrontendWithLastDeployed>(search);
      return fuseResult.map((r) => r.item);
    }
  }, [microfrontends, search]);

  return (
    <MainContent>
      <PageHeader>Microfrontends List</PageHeader>
      <PageExplanation
        docsLink="/docs/concepts/microfrontends"
        briefExplanation="Deploy microfrontends to edge locations around the world."
      />
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Find microfrontends"
          value={search}
          onChange={(evt) => setSearch(evt.target.value)}
          className="w-full"
        />
      </div>
      {filteredMicrofrontends.map((microfrontend) => (
        <MicrofrontendCard
          microfrontend={microfrontend}
          downloads={
            mfeDownloads.data?.microfrontendDownloads[microfrontend.name]
          }
          key={microfrontend.id}
        />
      ))}
    </MainContent>
  );
}

export function useMicrofrontends(): MicrofrontendWithLastDeployed[] {
  const { customerOrgId } = useConsoleParams();
  const rootProps = useContext(RootPropsContext);
  const queryResult = useQuery<unknown, Error, MicrofrontendWithLastDeployed[]>(
    `microfrontends-${customerOrgId}`,
    async function () {
      return (
        await baseplateFetch<EndpointGetMicrofrontendsResBody>(
          `/api/orgs/${customerOrgId}/microfrontends`,
          {},
          rootProps
        )
      ).microfrontends;
    },
    {
      suspense: true,
    }
  );

  return queryResult.data!;
}

function MicrofrontendCard({
  microfrontend,
  downloads,
}: {
  microfrontend: MicrofrontendWithLastDeployed;
  downloads?: MicrofrontendDownloads;
}) {
  const rootProps = useContext(RootPropsContext);
  const { customerOrgId } = useConsoleParams();
  const scope = microfrontend.useCustomerOrgKeyAsScope
    ? rootProps.userInformation.orgKey
    : microfrontend.scope;

  let lastDeployed: string;
  if (microfrontend.deployedAt) {
    lastDeployed = `Last deployed ${dayjs(microfrontend.deployedAt).fromNow()}`;
  } else {
    lastDeployed = `Never deployed`;
  }

  const downloadsLoaded = !!downloads;
  const weekOverWeekDownloadChange: null | number =
    !downloadsLoaded ||
    downloads.downloads7DaysBefore === null ||
    downloads.downloadsLast7Days === null
      ? null
      : downloads.downloadsLast7Days - downloads.downloads7DaysBefore;
  const wowUp =
    weekOverWeekDownloadChange !== null && weekOverWeekDownloadChange > 0;
  const wowDown =
    weekOverWeekDownloadChange !== null && weekOverWeekDownloadChange < 0;

  return (
    <Anchor
      className="block"
      kind={ButtonKind.transparent}
      to={`/console/${customerOrgId}/microfrontends/${microfrontend.id}`}
    >
      <Card
        className="mb-4"
        footer={
          <CardFooter className="text-gray-700 text-sm flex justify-end">
            {lastDeployed}
          </CardFooter>
        }
      >
        <div className="flex justify-between">
          <div>
            <div>{microfrontend.name}</div>
            {scope && (
              <div className="text-sm text-gray-700">
                @{scope}/{microfrontend.name}
              </div>
            )}
          </div>
          <div>
            <div className="text-gray-500 text-xs font-light">Downloads</div>
            <table className="text-xs font-light table-fixed w-17">
              <thead>
                <tr className="text-gray-500">
                  <th className="font-light w-5">Today</th>
                  <th className="font-light w-7">Week</th>
                  <th className="font-light">WoW</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr>
                  <td>
                    {formatDownloadCount(
                      downloadsLoaded,
                      downloads?.downloadsLast24Hrs
                    )}
                  </td>
                  <td>
                    {formatDownloadCount(
                      downloadsLoaded,
                      downloads?.downloadsLast7Days
                    )}
                  </td>
                  <td
                    className={maybe("text-lime-500", wowUp).maybe(
                      "text-red-500",
                      wowDown
                    )}
                  >
                    {trendArrow(wowUp, wowDown)}
                    {formatDownloadCount(
                      downloadsLoaded,
                      weekOverWeekDownloadChange
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </Anchor>
  );
}

function trendArrow(isUp: boolean, isDown: boolean): string {
  if (isUp) {
    return "\u21e7";
  } else if (isDown) {
    return "\u21e9";
  } else {
    return "";
  }
}

function formatDownloadCount(
  loaded: boolean,
  count: number | null | undefined
): string | number {
  if (!loaded) {
    // Still loading, show zero width space to ensure same height once it loads
    return "\u200B";
  } else if (count === null || count === undefined) {
    return "\u2014";
  } else {
    return Math.abs(count);
  }
}
