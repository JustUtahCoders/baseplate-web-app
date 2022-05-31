import {
  Component,
  FunctionComponent,
  lazy,
  ReactNode,
  Suspense,
  useState,
} from "react";
import { useParams } from "react-router";
import { MDXProvider } from "@mdx-js/react";
import { useTitle } from "../Utils/useTitle";

const inBrowser = typeof window !== "undefined";
let promiseLoad: (url: string) => Promise<{ default: FunctionComponent }>;
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
  const [notFound, setNotFound] = useState(false);
  const DocsComp = lazy(() =>
    promiseLoad(`${params.folder1}/${params.docsPage}.mdx`)
  );
  useTitle("Docs Page");

  if (notFound) {
    return <div>No such docs page.</div>;
  }

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
