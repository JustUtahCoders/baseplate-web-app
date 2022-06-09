export const inBrowser = typeof window !== "undefined";

export function useBrowserDimensions(): BrowserDimensions {
  return {
    isLg: inBrowser ? window.innerWidth > 1024 : false,
  };
}

export interface BrowserDimensions {
  isLg: boolean;
}
