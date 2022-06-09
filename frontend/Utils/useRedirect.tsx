import { useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { RootPropsContext } from "../App";
import { inBrowser } from "./browserHelpers";

export function useRedirect(redirectUrl: string) {
  const rootProps = useContext(RootPropsContext);
  const navigate = useNavigate();

  if (!inBrowser) {
    rootProps.ssrResult.redirectUrl = redirectUrl;
  }

  useEffect(() => {
    navigate(redirectUrl);
  }, [navigate, redirectUrl]);
}
