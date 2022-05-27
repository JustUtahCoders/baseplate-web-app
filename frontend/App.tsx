import { StaticRouter } from "react-router-dom/server";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Login } from "./Auth/Login";
import { ResetPassword } from "./Auth/ResetPassword";
import { ResetPasswordEmailSent } from "./Auth/ResetPasswordEmailSent";
import { FinishAccountCreation } from "./Auth/FinishAccountCreation";
import { DocsHome } from "./Docs/DocsHome";
import { DocsPage } from "./Docs/DocsPage";

const queryClient = new QueryClient();

export function App(props: AppProps) {
  const inBrowser = typeof window !== "undefined";

  const Router = inBrowser ? BrowserRouter : StaticRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com"></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro&display=swap"
          rel="stylesheet"
        ></link>
        <meta
          name="google-signin-client_id"
          content="437751451243-do7cqgls9rooar4q430cr57nu24cgb5n.apps.googleusercontent.com"
        ></meta>
        <script
          type="application/json"
          id="root-props"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(props) }}
        />
        {props.cssFiles.map((cssFile) => (
          <link
            key={cssFile}
            rel="stylesheet"
            href={`${props.assetBase}/${cssFile}`}
          ></link>
        ))}
      </head>
      <body>
        {/* @ts-ignore */}
        <Router context={props.routerContext} location={props.reqUrl}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/reset-password-email-sent"
              element={<ResetPasswordEmailSent />}
            />
            <Route
              path="/finish-account-creation"
              element={<FinishAccountCreation />}
            />
            <Route path="/" element={<div>Home</div>} />
            <Route path="/docs" element={<DocsHome />}>
              <Route path=":folder1/:docsPage" element={<DocsPage />} />
            </Route>
          </Routes>
        </Router>
        {props.jsFiles.map((jsFile) => (
          <script key={jsFile} src={`${props.assetBase}/${jsFile}`}></script>
        ))}
      </body>
    </QueryClientProvider>
  );
}

export interface RouterContext {
  url?: string;
}

export interface AppProps {
  routerContext: RouterContext;
  reqUrl: string;
  assetBase: string;
  jsFiles: string[];
  cssFiles: string[];
}
