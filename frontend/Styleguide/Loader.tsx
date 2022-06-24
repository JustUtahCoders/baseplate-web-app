import { VisuallyHidden } from "@reach/visually-hidden";
import { useEffect, useState } from "react";

export function Loader({ description, delay = 100 }: LoaderProps) {
  const [show, setShow] = useState(delay === 0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [show, delay]);

  if (!show) {
    return null;
  }

  return (
    <>
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r={"1.5rem"}
          className="fill-current text-primary"
        ></circle>
      </svg>
      <VisuallyHidden>{description}</VisuallyHidden>
    </>
  );
}

export interface LoaderProps {
  description: string;
  delay?: number;
}
