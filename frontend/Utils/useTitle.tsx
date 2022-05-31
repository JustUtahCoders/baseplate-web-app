import { useContext, useEffect } from "react";
import { SSRResultContext } from "../App";

export function useTitle(title: string | Promise<string>): void {
  const ssrResultContext = useContext(SSRResultContext);

  if (typeof document === "undefined") {
    ssrResultContext.ejsData.pageTitle = title;
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
