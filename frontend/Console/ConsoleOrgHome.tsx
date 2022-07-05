import { useConsoleParams } from "../Utils/paramHelpers";
import { useRedirect } from "../Utils/useRedirect";

export function ConsoleOrgHome() {
  const { customerOrgId } = useConsoleParams();
  useRedirect(`/console/${customerOrgId}/microfrontends`, true, true);

  return null;
}
