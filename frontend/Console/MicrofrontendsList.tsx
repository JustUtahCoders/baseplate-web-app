import { useQuery } from "react-query";
import { Microfrontend } from "../../backend/DB/Models/Microfrontend/Microfrontend";
import { EndpointGetMicrofrontendsResBody } from "../../backend/TSEntry";
import { baseplateFetch } from "../Utils/baseplateFetch";
import { useCustomerOrgId } from "../Utils/useCustomerOrgId";

export function MicrofrontendsList() {
  const microfrontends = useMicrofrontends();

  return (
    <>
      {microfrontends.map((microfrontend) => (
        <MicrofrontendCard
          microfrontend={microfrontend}
          key={microfrontend.id}
        />
      ))}
    </>
  );
}

export function useMicrofrontends(): Microfrontend[] {
  const customerOrgId = useCustomerOrgId();
  const queryResult = useQuery<unknown, Error, Microfrontend[]>(
    `microfrontends-${customerOrgId}`,
    async function () {
      if (global.IN_WEBPACK) {
        return (
          await baseplateFetch<EndpointGetMicrofrontendsResBody>(
            `/api/orgs/${customerOrgId}/microfrontends`
          )
        ).microfrontends;
      } else {
        const MicrofrontendModel = (
          await import(
            /* webpackIgnore: true */ "../../backend/DB/Models/Microfrontend/Microfrontend"
          )
        ).MicrofrontendModel;
        return await MicrofrontendModel.findAll({
          where: {
            customerOrgId,
          },
        });
      }
    },
    {
      suspense: true,
    }
  );

  return queryResult.data!;
}

function MicrofrontendCard({
  microfrontend,
}: {
  microfrontend: Microfrontend;
}) {
  return <div>{microfrontend.name}</div>;
}
