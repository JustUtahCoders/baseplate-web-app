import {
  QueryCommandOutput,
  TimestreamQueryClient,
} from "@aws-sdk/client-timestream-query";
import { EndpointGetMicrofrontendsDownloadsResBody } from "../RestAPI/Microfrontends/MicrofrontendDownloads";

export const timestreamClient = new TimestreamQueryClient({
  region: "us-east-1",
});

export function getSingleTimestreamResult(
  result: QueryCommandOutput,
  columnName: string
): string | undefined {
  if (!result.ColumnInfo || !result.Rows) {
    return `Invalid response from Timestream - no ColumnInfo or Rows`;
  }

  const colIndex = result.ColumnInfo.findIndex((c) => c.Name === columnName);

  if (isNaN(colIndex)) {
    throw Error(
      `Invalid response from Timestream - could not find column '${columnName}'`
    );
  }

  if (result.Rows.length === 0) {
    return undefined;
  }

  const rowData = result.Rows[0].Data;

  if (rowData) {
    return rowData[colIndex].ScalarValue;
  } else {
    throw Error(`Invalid response from Timestream - no row data`);
  }
}

export function addTimestreamMFEDownloadsResult(
  metricName: string,
  result: QueryCommandOutput,
  microfrontendDownloads: EndpointGetMicrofrontendsDownloadsResBody["microfrontendDownloads"]
): string | void {
  if (!result.ColumnInfo || !result.Rows) {
    return `Invalid response from Timestream for ${metricName} - no ColumnInfo or Rows`;
  }

  const microfrontendNameIndex = result.ColumnInfo.findIndex(
    (c) => c.Name === "microfrontendName"
  );
  const downloadsIndex = result.ColumnInfo.findIndex(
    (c) => c.Name === "downloads"
  );

  if (isNaN(microfrontendNameIndex) || isNaN(downloadsIndex)) {
    return `Invalid response from Timestream for ${metricName} - invalid column indices`;
  }

  result.Rows.reduce((acc, row) => {
    const microfrontendName =
      row.Data && row.Data[microfrontendNameIndex].ScalarValue;
    const downloads = row.Data && Number(row.Data[downloadsIndex].ScalarValue);

    if (microfrontendName) {
      if (!acc[microfrontendName]) {
        acc[microfrontendName] = {
          downloadsLast24Hrs: null,
          downloadsLast7Days: null,
          downloads7DaysBefore: null,
        };
      }

      acc[microfrontendName][metricName] = downloads || null;
    }

    return acc;
  }, microfrontendDownloads);
}
