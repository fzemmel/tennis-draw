import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "tennis_state_v1";
const LANGUAGE_KEY = "tennis_language_v1";

interface RenderResult {
  container: HTMLDivElement;
  root: Root;
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

async function renderMixer(): Promise<RenderResult> {
  vi.resetModules();

  const { TennisMixer } = await import("./TennisMixer");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<TennisMixer />);
  });
  await flush();

  return { container, root };
}

function getText(container: HTMLElement): string {
  return container.textContent ?? "";
}

function getButtonByText(container: HTMLElement, text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find((candidate) =>
    candidate.textContent?.includes(text),
  );

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Button not found: ${text}`);
  }

  return button;
}

function getButtonByLabel(
  container: HTMLElement,
  label: string,
): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find(
    (candidate) => candidate.getAttribute("aria-label") === label,
  );

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Button not found: ${label}`);
  }

  return button;
}

async function click(element: HTMLElement): Promise<void> {
  await act(async () => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await flush();
}

async function unmount(root: Root): Promise<void> {
  await act(async () => {
    root.unmount();
  });
}

beforeEach(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  document.body.innerHTML = "";
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("TennisMixer localization", () => {
  it("uses German by default across the splash and active game views", async () => {
    const { container, root } = await renderMixer();

    expect(getText(container)).toContain("Wer spielt heute?");
    expect(getText(container)).toContain("Spieler auswählen");
    expect(getText(container)).toContain("Spiel starten");
    expect(getText(container)).not.toContain("Who is playing today?");
    expect(localStorage.getItem(LANGUAGE_KEY)).toBeNull();

    await click(getButtonByText(container, "Spiel starten"));

    expect(getText(container)).toContain("Spiel 1");
    expect(getText(container)).toContain("Nächster Wechsel");
    expect(getText(container)).toContain("PAUSE");
    expect(getText(container)).not.toContain("Game 1");
    expect(getText(container)).not.toContain("Next change");

    await unmount(root);
  });

  it("switches locales from both views and restores the persisted language", async () => {
    let view = await renderMixer();

    await click(getButtonByLabel(view.container, "Sprache zu Englisch wechseln"));

    expect(getText(view.container)).toContain("Who is playing today?");
    expect(getText(view.container)).toContain("Select players");
    expect(getText(view.container)).toContain("Start game");
    expect(getText(view.container)).not.toContain("Wer spielt heute?");
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe("en");

    await click(getButtonByText(view.container, "Start game"));

    expect(getText(view.container)).toContain("Game 1");
    expect(getText(view.container)).toContain("Next change");
    expect(getText(view.container)).toContain("BENCH");
    expect(getText(view.container)).not.toContain("Spiel 1");
    expect(getText(view.container)).not.toContain("Nächster Wechsel");
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    await click(getButtonByLabel(view.container, "Switch language to German"));

    expect(getText(view.container)).toContain("Spiel 1");
    expect(getText(view.container)).toContain("Nächster Wechsel");
    expect(getText(view.container)).not.toContain("Game 1");
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe("de");

    await unmount(view.root);

    view = await renderMixer();

    expect(getText(view.container)).toContain("Spiel 1");
    expect(getText(view.container)).toContain("Nächster Wechsel");
    expect(getText(view.container)).not.toContain("Game 1");

    await unmount(view.root);
  });
});
