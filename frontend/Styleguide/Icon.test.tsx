import { render } from "@testing-library/react";
import { Icon, IconVariant } from "./Icon";

describe("<Icon />", () => {
  it(`renders an accessible node`, () => {
    let w;

    Object.keys(IconVariant).forEach((iconVariant) => {
      if (w) {
        w.unmount();
      }

      w = render(<Icon variant={iconVariant as IconVariant} />);

      expect(w.baseElement.querySelector(".sr-only")).toBeInTheDocument();

      w.rerender(
        <Icon variant={iconVariant as IconVariant} alt="Donkey Kong" />
      );

      expect(w.queryByText("Donkey Kong")).toBeInTheDocument();
    });
  });

  it(`respects the size prop`, () => {
    let w;

    Object.keys(IconVariant).forEach((iconVariant) => {
      if (w) {
        w.unmount();
      }

      w = render(<Icon variant={iconVariant as IconVariant} alt="the image" />);
      let svgEl = w.baseElement.querySelector("svg");
      expect(svgEl.getAttribute("height")).toBe(`16px`);
      expect(svgEl.getAttribute("width")).toBe(`16px`);

      w.rerender(
        <Icon variant={iconVariant as IconVariant} alt="the image" size={26} />
      );
      svgEl = w.baseElement.querySelector("svg");
      expect(svgEl.getAttribute("height")).toBe(`26px`);
      expect(svgEl.getAttribute("width")).toBe(`26px`);
    });
  });
});
