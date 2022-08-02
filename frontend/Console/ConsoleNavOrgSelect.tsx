import { useQuery } from "react-query";
import { useConsoleParams } from "../Utils/paramHelpers";
import { CustomerOrg } from "../../backend/DB/Models/CustomerOrg/CustomerOrg";
import { EndpointGetAllCustomerOrgsResBody } from "../../backend/RestAPI/OrgSettings/GetAllCustomerOrgs";
import { baseplateFetch } from "../Utils/baseplateFetch";
import { SecondaryNavItem } from "../Styleguide/SecondaryNav";
import { useRedirect } from "../Utils/useRedirect";
import { ChangeEvent, useContext } from "react";
import { useNavigate, useLocation } from "react-router";
import { RootPropsContext } from "../App";

export function ConsoleNavOrgSelect() {
  const { allUserCustomerOrgs, selectedCustomerOrg } = useCustomerOrg();
  const navigate = useNavigate();
  const location = useLocation();
  useRedirect("/console/select-org", !selectedCustomerOrg);

  return (
    <SecondaryNavItem>
      {allUserCustomerOrgs.length > 1 ? (
        <select value={selectedCustomerOrg?.id} onChange={handleChange}>
          {allUserCustomerOrgs.map((customerOrg) => (
            <option value={customerOrg.id} key={customerOrg.id}>
              {customerOrg.name}
            </option>
          ))}
        </select>
      ) : (
        <div className="text-sm text-gray-800">{selectedCustomerOrg?.name}</div>
      )}
    </SecondaryNavItem>
  );

  function handleChange(evt: ChangeEvent<HTMLSelectElement>) {
    const pathSuffix = location.pathname.replace(
      `/console/${selectedCustomerOrg!.id}`,
      ""
    );
    navigate(`/console/${evt.target.value}${pathSuffix}`);
  }
}

export function useCustomerOrg(): ConsoleCustomerOrg {
  const rootProps = useContext(RootPropsContext);
  const { customerOrgId } = useConsoleParams();
  const query = useQuery<unknown, Error, CustomerOrg[]>(
    `user-customer-orgs`,
    async () => {
      const response = await baseplateFetch<EndpointGetAllCustomerOrgsResBody>(
        "/api/orgs/all",
        {},
        rootProps
      );
      return response.customerOrgs;
    },
    {
      suspense: true,
    }
  );

  return {
    allUserCustomerOrgs: query.data!,
    selectedCustomerOrg: query.data!.find(
      (customerOrg) => customerOrg.id === customerOrgId
    ),
  };
}

export interface ConsoleCustomerOrg {
  selectedCustomerOrg?: CustomerOrg;
  allUserCustomerOrgs: CustomerOrg[];
}
