import { render } from "@testing-library/react";
import { MicrofrontendsList } from "./MicrofrontendsList";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "react-query";
import { Microfrontend } from "../../../backend/DB/Models/Microfrontend/Microfrontend";

describe(`<MicrofrontendsList />`, () => {
  let customerOrgId = "customerOrgId",
    userId = "userId";

  it("Renders cards for every microfrontend", async () => {
    const queryClient = new QueryClient();
    const microfrontends: Microfrontend[] = [
      {
        id: "78fsd7",
        auditAccountId: userId,
        customerOrgId,
        name: "navbar",
        useCustomerOrgKeyAsScope: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "8787dsf",
        auditAccountId: userId,
        customerOrgId,
        name: "settings",
        useCustomerOrgKeyAsScope: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    queryClient.setQueryData("microfrontends-customerOrgId", microfrontends);

    const w = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[`/console/${customerOrgId}/microfrontends`]}
        >
          <Routes>
            <Route
              path="/console/:customerOrgId/microfrontends"
              element={<MicrofrontendsList />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    const navbar = await w.findByText("navbar");
    const settings = await w.findByText("settings");
    expect(navbar).toBeInTheDocument();
    expect(settings).toBeInTheDocument();
  });
});
