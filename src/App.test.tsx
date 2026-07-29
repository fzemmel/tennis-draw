import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

const { analyticsSpy } = vi.hoisted(() => ({
  analyticsSpy: vi.fn((props: { debug?: boolean }) => {
    void props;
    return null;
  }),
}));

vi.mock("@vercel/analytics/react", () => ({
  Analytics: analyticsSpy,
}));

vi.mock("./components/TennisMixer/TennisMixer", () => ({
  TennisMixer: () => null,
}));

describe("App", () => {
  it("mounts Vercel Analytics once without debug or custom data", async () => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    const container = document.createElement("div");
    const root = createRoot(container);

    await act(async () => {
      root.render(<App />);
    });

    expect(analyticsSpy).toHaveBeenCalledTimes(1);
    expect(analyticsSpy.mock.calls[0]?.[0]).toEqual({ debug: false });

    await act(async () => {
      root.unmount();
    });
  });
});
