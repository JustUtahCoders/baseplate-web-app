import { Card } from "../Styleguide/Card";
import { MainContent } from "../Styleguide/MainContent";
import { PageExplanation, PageHeader } from "../Styleguide/PageHeader";

export function ConsolePageNotFound() {
  return (
    <MainContent>
      <PageHeader>Page Not Found</PageHeader>
      <PageExplanation briefExplanation="To get to where you want to go, try clicking a navbar link, or checking the URL for a typo" />
    </MainContent>
  );
}
