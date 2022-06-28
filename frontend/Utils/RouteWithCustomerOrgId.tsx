import { useContext, ReactNode } from "react";
import { Route } from "react-router";
import { RootPropsContext } from "../App";
import { useRedirect } from "./useRedirect";

export function RouteWithCustomerOrgId(props: RouteWithCustomerOrgIdProps) {
  return (
    <>
      <Route
        path={`/console/:customerOrgId/${props.pathSuffix}`}
        element={props.element}
      >
        {props.children}
      </Route>
      <Route
        path={`/console/${props.pathSuffix}`}
        element={<RedirectWithCustomerOrgId pathSuffix={props.pathSuffix} />}
      >
        {props.children}
      </Route>
    </>
  );
}

interface RouteWithCustomerOrgIdProps {
  pathSuffix: string;
  element: ReactNode;
  children?: ReactNode;
}

function RedirectWithCustomerOrgId(props: RedirectWithCustomerOrgIdProps) {
  const rootProps = useContext(RootPropsContext);
  const mostRecentCustomerOrgId =
    rootProps.userInformation.userPreferences?.mostRecentCustomerOrgId;
  const redirectUrl = mostRecentCustomerOrgId
    ? `/console/${mostRecentCustomerOrgId}/${props.pathSuffix}`
    : "/console/select-org";
  useRedirect(redirectUrl, true, true);

  return null;
}

interface RedirectWithCustomerOrgIdProps {
  pathSuffix: string;
}
