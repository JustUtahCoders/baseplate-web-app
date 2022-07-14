import { useParams } from "react-router";

export function useConsoleParams(): { customerOrgId: string } {
  const params = useParams<{ customerOrgId: string }>();
  return {
    customerOrgId: params.customerOrgId!,
  };
}

export function useMicrofrontendParams(): MicrofrontendParams {
  const params = useParams<{
    customerOrgId: string;
    microfrontendId: string;
  }>();
  return {
    customerOrgId: params.customerOrgId!,
    microfrontendId: params.microfrontendId!,
  };
}

export function useEnvironmentParams(): EnvironmentParams {
  const params = useParams<{
    customerOrgId: string;
    environmentId: string;
  }>();
  return {
    customerOrgId: params.customerOrgId!,
    environmentId: params.environmentId!,
  };
}

interface MicrofrontendParams {
  customerOrgId: string;
  microfrontendId: string;
}

interface EnvironmentParams {
  customerOrgId: string;
  environmentId: string;
}
