import { useParams } from "react-router";
import { useRedirect } from "../Utils/useRedirect";

export function ConsoleOrgHome() {
  const params = useParams<{ customerOrgId: string }>();
  useRedirect(`/console/${params.customerOrgId}/microfrontends`, true, true);

  return null;
}
