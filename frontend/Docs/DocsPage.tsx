import { Component, FunctionComponent, lazy, ReactNode, Suspense } from "react";
import { useParams } from "react-router";
import { MDXProvider } from "@mdx-js/react";
import { useTitle } from "../Utils/useTitle";

const inBrowser = typeof window !== "undefined";
let promiseLoad: (url: string) => Promise<DocModule>;
let webpackContext: __WebpackModuleApi.RequireContext;

if (inBrowser) {
  webpackContext = require.context("../../docs", true, /\.mdx?$/);
  promiseLoad = async (url: string) => {
    return webpackContext("./" + url);
  };
} else {
  promiseLoad = (url: string) => import(`../../docs/${url}`);
}

const mdxComponents = {};

export function DocsPage(props: Props) {
  const params = useParams();

  const filePath = `${params.folder1}/${params.docsPage}.mdx`;

  const DocsComp = lazy(() => promiseLoad(filePath));

  useTitle(
    promiseLoad(filePath).then((m) => m.title || "Baseplate Documentation")
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <MDXProvider components={mdxComponents}>
          <DocsComp />
        </MDXProvider>
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

interface DocModule {
  default: FunctionComponent;
  title?: string;
}
