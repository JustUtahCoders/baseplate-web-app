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
import { createContext } from "react";

const queryClient = new QueryClient();
export const RootPropsContext = createContext<AppProps>({
  reqUrl: "/",
  ssrResult: {
    ejsData: {
      pageTitle: "Baseplate",
    },
  },
  userInformation: {
    isLoggedIn: false,
  },
});

export function App(props: AppProps) {
  const inBrowser = typeof window !== "undefined";

  const Router = inBrowser ? BrowserRouter : StaticRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <RootPropsContext.Provider value={props}>
        <Router location={props.reqUrl}>
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
      </RootPropsContext.Provider>
    </QueryClientProvider>
  );
}

export interface AppProps {
  userInformation: UserInformation;
  ssrResult: SSRResult;
  reqUrl: string;
}

export interface UserInformation {
  isLoggedIn: boolean;
  orgKey?: string;
}

export interface SSRResult {
  redirectUrl?: string;
  ejsData: EJSData;
}

export interface EJSData {
  pageTitle: string | Promise<string>;
}
