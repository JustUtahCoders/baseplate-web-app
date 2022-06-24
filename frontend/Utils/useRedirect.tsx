import { useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { RootPropsContext } from "../App";
import { inBrowser } from "./browserHelpers";

export function useRedirect(
  redirectUrl: string,
  shouldRedirect: boolean = true,
  replace: boolean = false
) {
  const rootProps = useContext(RootPropsContext);
  const navigate = useNavigate();

  if (!inBrowser && shouldRedirect) {
    rootProps.ssrResult.redirectUrl = redirectUrl;
  }

  useEffect(() => {
    if (shouldRedirect) {
      navigate(redirectUrl, {
        replace,
      });
    }
  }, [navigate, redirectUrl, shouldRedirect, replace]);
}
