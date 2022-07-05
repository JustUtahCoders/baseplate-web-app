import { hydrateRoot } from "react-dom/client";
import * as React from "react";
import { App, AppProps } from "./App";
import "tailwindcss/tailwind.css";

const rootProps = JSON.parse(
  (document.querySelector("script#root-props") as HTMLElement)
    .textContent as string
) as AppProps;

hydrateRoot(
  document.getElementById("react-root") as HTMLDivElement,
  <App {...rootProps} />
);
