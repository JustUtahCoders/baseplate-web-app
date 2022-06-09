import { useRedirect } from "../Utils/useRedirect";

export function ConsoleHome() {
  useRedirect("/console/microfrontends");

  return null;
}
