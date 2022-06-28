import { useQuery } from "react-query";
import { CustomerOrg } from "../../backend/DB/Models/CustomerOrg/CustomerOrg";
import { EndpointGetAllCustomerOrgsResBody } from "../../backend/RestAPI/OrgSettings/GetAllCustomerOrgs";
import { Anchor } from "../Styleguide/Anchor";
import { ButtonKind } from "../Styleguide/Button";
import { Card } from "../Styleguide/Card";
import { Loader } from "../Styleguide/Loader";
import { MainContent } from "../Styleguide/MainContent";
import { PageHeader } from "../Styleguide/PageHeader";
import { baseplateFetch } from "../Utils/baseplateFetch";

export function SelectOrg() {
  const userCustomerOrgsQuery = useQuery<unknown, Error, CustomerOrg[]>(
    `user-customer-orgs`,
    async function () {
      const response = await baseplateFetch<EndpointGetAllCustomerOrgsResBody>(
        `/api/orgs/all`
      );
      return response.customerOrgs;
    }
  );

  if (userCustomerOrgsQuery.isLoading) {
    return (
      <MainContent>
        <Loader description="Loading the organizations you have access to" />
      </MainContent>
    );
  } else if (userCustomerOrgsQuery.isError) {
    return (
      <MainContent>
        <div>
          There was an error loading the organizations you have access to.
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <PageHeader>Select an organization to view</PageHeader>
      {userCustomerOrgsQuery.data!.map((customerOrg) => (
        <Anchor
          key={customerOrg.id}
          kind={ButtonKind.transparent}
          className="block mt-4"
          to={`/console/${customerOrg.id}`}
        >
          <Card
            contentProps={{ className: "flex justify-between items-center" }}
          >
            <div>
              <div>{customerOrg.name}</div>
              <div className="text-sm text-gray-600">{customerOrg.orgKey}</div>
            </div>
            <div className="text-xs text-gray-400 hidden md:block">
              {customerOrg.id}
            </div>
          </Card>
        </Anchor>
      ))}
    </MainContent>
  );
}
