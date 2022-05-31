import {
  Component,
  FunctionComponent,
  lazy,
  ReactNode,
  Suspense,
  useContext,
} from "react";
import { useParams } from "react-router";
import { useTitle } from "../Utils/useTitle";
import { loadDocModule } from "./DocsUtils";
import { RootPropsContext } from "../App";
import { CdnUrl } from "./CdnUrl";

export function DocsPage(props: Props) {
  const params = useParams();
  const rootProps = useContext(RootPropsContext);

  const filePath = `${params.folder1}/${params.docsPage}.mdx`;

  const DocsComp = lazy<FunctionComponent<{ orgKey: string; components: any }>>(
    () => loadDocModule(filePath)
  );

  useTitle(
    loadDocModule(filePath).then(
      (m) => m.pageTitle ?? "Baseplate Documentation"
    )
  );

  const orgKey = rootProps.userInformation.orgKey ?? ":orgKey";

  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <DocsComp orgKey={orgKey} components={{ CdnUrl }} />
      </Suspense>
    </ErrorBoundary>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }> {
  state = {
    hasError: false,
  };
  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
    });
  }
  render() {
    if (this.state.hasError) {
      return <div>No such documentation page</div>;
    } else {
      return this.props.children;
    }
  }
}

interface Props {}
