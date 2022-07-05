import { useParams } from "react-router";

export function useConsoleParams(): { customerOrgId: string } {
  const params = useParams<{ customerOrgId: string }>();
  return {
    customerOrgId: params.customerOrgId!,
  };
}

export function useMicrofrontendParams(): CommonParams {
  const params = useParams<{
    customerOrgId: string;
    microfrontendId: string;
  }>();
  return {
    customerOrgId: params.customerOrgId!,
    microfrontendId: params.microfrontendId!,
  };
}

interface CommonParams {
  customerOrgId: string;
  microfrontendId: string;
}
