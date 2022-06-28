import { useRedirect } from "../Utils/useRedirect";

export function ConsoleHome() {
  useRedirect("/console/microfrontends", true, true);

  return null;
}
