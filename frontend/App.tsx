import { StaticRouter } from "react-router-dom/server";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Login } from "./Auth/Login";
import { ResetPassword } from "./Auth/ResetPassword";
import { ResetPasswordEmailSent } from "./Auth/ResetPasswordEmailSent";
import { FinishAccountCreation } from "./Auth/FinishAccountCreation";
import { Docs } from "./Docs/Docs";
import { DocsPage } from "./Docs/DocsPage";
import { createContext, useState } from "react";
import "./App.css";
import { DocsHome } from "./Docs/DocsHome";
import { inBrowser } from "./Utils/browserHelpers";
import { isEqual } from "lodash-es";
import { ConsoleHome } from "./Console/ConsoleHome";
import { MicrofrontendsList } from "./Console/MicrofrontendsList";
import { UserPreferencesAttributes } from "../backend/DB/Models/User/UserPreferences";
import { RouteWithCustomerOrgId } from "./Utils/RouteWithCustomerOrgId";

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
    userPreferences: {
      auditAccountId: "",
      id: "",
      userId: "",
    },
  },
});

export function App(props: AppProps) {
  const [pageLayout, setPageLayout] =
    useState<Omit<PageLayout, "setSecondaryNav">>(defaultPageLayout);

  const Router = inBrowser ? BrowserRouter : StaticRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <RootPropsContext.Provider value={props}>
        <PageLayoutContext.Provider value={{ ...pageLayout, setSecondaryNav }}>
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
              <Route path="/console" element={<ConsoleHome />} />
              {RouteWithCustomerOrgId({
                pathSuffix: "microfrontends",
                element: <MicrofrontendsList />,
              })}
              <Route path="/docs" element={<Docs />}>
                <Route path="" element={<DocsHome />} />
                <Route path=":folder1/:docsPage" element={<DocsPage />} />
              </Route>
            </Routes>
          </Router>
        </PageLayoutContext.Provider>
      </RootPropsContext.Provider>
    </QueryClientProvider>
  );

  function setSecondaryNav(newLayout: SecondaryNavLayout) {
    if (!isEqual(newLayout, pageLayout.secondaryNav)) {
      setPageLayout({
        ...pageLayout,
        secondaryNav: newLayout,
      });
    }
  }
}

export interface AppProps {
  userInformation: UserInformation;
  ssrResult: SSRResult;
  reqUrl: string;
}

export interface UserInformation {
  isLoggedIn: boolean;
  orgKey?: string;
  userPreferences?: UserPreferencesAttributes;
}

export interface SSRResult {
  redirectUrl?: string;
  ejsData: EJSData;
}

export interface EJSData {
  pageTitle: string | Promise<string>;
}

interface SecondaryNavLayout {
  present: boolean;
  orientation: NavOrientation;
  collapsed: boolean;
}

export interface PageLayout {
  setSecondaryNav(newLayout: SecondaryNavLayout): void;
  secondaryNav: SecondaryNavLayout;
}

export enum NavOrientation {
  vertical = "vertical",
  horizontal = "horizaontal",
}

const defaultPageLayout: Omit<PageLayout, "setSecondaryNav"> = {
  secondaryNav: {
    present: false,
    orientation: NavOrientation.horizontal,
    collapsed: false,
  },
};

export const PageLayoutContext = createContext<PageLayout>({
  ...defaultPageLayout,
  setSecondaryNav() {},
});
