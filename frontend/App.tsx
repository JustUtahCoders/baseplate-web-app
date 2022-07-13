import "./Utils/dayjsUtils";
import { StaticRouter } from "react-router-dom/server";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { createContext, lazy, Suspense, useState } from "react";
import "./App.css";
import { DocsHome } from "./Docs/DocsHome";
import { inBrowser } from "./Utils/browserHelpers";
import { isEqual } from "lodash-es";
import { UserPreferencesAttributes } from "../backend/DB/Models/User/UserPreferences";
import { RouteWithCustomerOrgId } from "./Utils/RouteWithCustomerOrgId";
import { MainContent } from "./Styleguide/MainContent";
import { Loader } from "./Styleguide/Loader";
import { EnvironmentConfiguration } from "./Console/Environments/EnvironmentConfiguration";

const Login = lazy(() =>
  import("./Auth/Login").then((m) => ({ default: m.Login }))
);
const ResetPassword = lazy(() =>
  import("./Auth/ResetPassword").then((m) => ({ default: m.ResetPassword }))
);
const ResetPasswordEmailSent = lazy(() =>
  import("./Auth/ResetPasswordEmailSent").then((m) => ({
    default: m.ResetPasswordEmailSent,
  }))
);
const FinishAccountCreation = lazy(() =>
  import("./Auth/FinishAccountCreation").then((m) => ({
    default: m.FinishAccountCreation,
  }))
);
const Docs = lazy(() =>
  import("./Docs/Docs").then((m) => ({ default: m.Docs }))
);
const DocsPage = lazy(() =>
  import("./Docs/DocsPage").then((m) => ({ default: m.DocsPage }))
);
const ConsoleHome = lazy(() =>
  import("./Console/ConsoleHome").then((m) => ({ default: m.ConsoleHome }))
);
const MicrofrontendsList = lazy(() =>
  import("./Console/Microfrontends/MicrofrontendsList").then((m) => ({
    default: m.MicrofrontendsList,
  }))
);
const MicrofrontendDetail = lazy(() =>
  import("./Console/Microfrontends/MicrofrontendDetail").then((m) => ({
    default: m.MicrofrontendDetail,
  }))
);
const MicrofrontendHome = lazy(() =>
  import("./Console/Microfrontends/MicrofrontendDetail").then((m) => ({
    default: m.MicrofrontendHome,
  }))
);
const MicrofrontendDeployments = lazy(() =>
  import("./Console/Microfrontends/MicrofrontendDeployments").then((m) => ({
    default: m.MicrofrontendDeployments,
  }))
);
const MicrofrontendConfiguration = lazy(() =>
  import("./Console/Microfrontends/MicrofrontendConfiguration").then((m) => ({
    default: m.MicrofrontendConfiguration,
  }))
);
const MicrofrontendAccess = lazy(() =>
  import("./Console/Microfrontends/MicrofrontendAccess").then((m) => ({
    default: m.MicrofrontendAccess,
  }))
);
const EnvironmentsList = lazy(() =>
  import("./Console/Environments/EnvironmentsList").then((m) => ({
    default: m.EnvironmentsList,
  }))
);
const EnvironmentDetail = lazy(() =>
  import("./Console/Environments/EnvironmentDetail").then((m) => ({
    default: m.EnvironmentDetail,
  }))
);
const EnvironmentHome = lazy(() =>
  import("./Console/Environments/EnvironmentDetail").then((m) => ({
    default: m.EnvironmentHome,
  }))
);
const EnvironmenetConfiguration = lazy(() =>
  import("./Console/Environments/EnvironmentConfiguration").then((m) => ({
    default: m.EnvironmentConfiguration,
  }))
);
const EnvironmentAccess = lazy(() =>
  import("./Console/Environments/EnvironmentAccess").then((m) => ({
    default: m.EnvironmentAccess,
  }))
);
const SelectOrg = lazy(() =>
  import("./Console/SelectOrg").then((m) => ({ default: m.SelectOrg }))
);
const ConsoleOrgHome = lazy(() =>
  import("./Console/ConsoleOrgHome").then((m) => ({
    default: m.ConsoleOrgHome,
  }))
);
const MicrofrontendAbout = lazy(() =>
  import("./Console/Microfrontends/MicrofrontendAbout").then((m) => ({
    default: m.MicrofrontendAbout,
  }))
);

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
          <Suspense
            fallback={
              <MainContent>
                <Loader description="Loading route" delay={100} />
              </MainContent>
            }
          >
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
                {RouteWithCustomerOrgId({
                  pathSuffix: "microfrontends/:microfrontendId",
                  element: <MicrofrontendDetail />,
                  children: (
                    <>
                      <Route
                        path="deployments"
                        element={<MicrofrontendDeployments />}
                      />
                      <Route path="access" element={<MicrofrontendAccess />} />
                      <Route
                        path="configuration"
                        element={<MicrofrontendConfiguration />}
                      />
                      <Route path="about" element={<MicrofrontendAbout />} />
                      <Route path="" element={<MicrofrontendHome />} />
                    </>
                  ),
                })}
                {RouteWithCustomerOrgId({
                  pathSuffix: "environments",
                  element: <EnvironmentsList />,
                })}
                {RouteWithCustomerOrgId({
                  pathSuffix: "environments/:environmentId",
                  element: <EnvironmentDetail />,
                  children: (
                    <>
                      <Route
                        path="configuration"
                        element={<EnvironmentConfiguration />}
                      />
                      <Route path="access" element={<EnvironmentAccess />} />
                      <Route path="" element={<EnvironmentHome />} />
                    </>
                  ),
                })}
                <Route path="/console/select-org" element={<SelectOrg />} />
                <Route
                  path="/console/:customerOrgId"
                  element={<ConsoleOrgHome />}
                />
                <Route path="/docs" element={<Docs />}>
                  <Route path="" element={<DocsHome />} />
                  <Route path=":folder1/:docsPage" element={<DocsPage />} />
                </Route>
              </Routes>
            </Router>
          </Suspense>
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
