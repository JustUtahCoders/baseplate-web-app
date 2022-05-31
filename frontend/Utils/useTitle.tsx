import { useContext, useEffect } from "react";
import { SSRResultContext } from "../App";

export function useTitle(title: string): void {
  const ssrResultContext = useContext(SSRResultContext);

  useEffect(() => {
    if (typeof document !== "undefined") {
      console.log("setting browser title", document.title, title);
      document.title = title;
    } else {
      console.log("setting html title context", title);
      ssrResultContext.ejsData.pageTitle = title;
    }
  });
}
