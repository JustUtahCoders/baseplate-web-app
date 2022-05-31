import { useContext } from "react";
import { RootPropsContext } from "../App";

export function CdnUrl(props: Props) {
  const rootProps = useContext(RootPropsContext);

  return (
    <div className="">
      https://cdn.baseplate.cloud/{rootProps.userInformation.orgKey}/
      {props.path}
    </div>
  );
}

interface Props {
  path: string;
}
