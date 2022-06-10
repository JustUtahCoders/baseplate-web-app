import { useParams } from "react-router";

export function useCustomerOrgId(): string {
  const params = useParams();

  const customerOrgId = params.customerOrgId;

  if (!customerOrgId) {
    throw new Error(`customerOrgId is not in url params`);
  }

  return customerOrgId;
}
