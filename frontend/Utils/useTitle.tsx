import { useContext, useEffect } from "react";
import { RootPropsContext } from "../App";

export function useTitle(title: string | Promise<string>): void {
  const rootPropsContext = useContext(RootPropsContext);

  if (typeof document === "undefined") {
    rootPropsContext.ssrResult.ejsData.pageTitle = title;
  }

  useEffect(() => {
    let titlePromise: Promise<string>;
    if (typeof title === "string") {
      titlePromise = Promise.resolve(title);
    } else {
      titlePromise = title;
    }

    let canceled: boolean = false;

    titlePromise.then((title) => {
      if (!canceled && typeof document !== "undefined") {
        document.title = title;
      }
    });

    return () => {
      canceled = true;
    };
  });
}
