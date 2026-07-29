import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { Splashscreen } from "../components/TennisMixer/Splashscreen";
import { getTranslations } from "../lib/i18n";
import { PLAYERS } from "../lib/tennis";
import { storyLanguage } from "./storybook";

type SplashscreenProps = ComponentProps<typeof Splashscreen>;

function InteractiveSplashscreen({
  pool: initialPool,
  language: initialLanguage,
  onPoolChange,
  onLanguageChange,
  ...props
}: SplashscreenProps) {
  const [pool, setPool] = useState(initialPool);
  const [language, setLanguage] = useState(initialLanguage);

  function handlePoolChange(nextPool: string[]) {
    setPool(nextPool);
    onPoolChange(nextPool);
  }

  function handleLanguageChange(nextLanguage: SplashscreenProps["language"]) {
    setLanguage(nextLanguage);
    onLanguageChange(nextLanguage);
  }

  return (
    <Splashscreen
      {...props}
      pool={pool}
      language={language}
      onPoolChange={handlePoolChange}
      onLanguageChange={handleLanguageChange}
    />
  );
}

const meta: Meta<typeof Splashscreen> = {
  title: "TennisMixer/Splashscreen",
  component: Splashscreen,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    pool: [...PLAYERS],
    onStart: fn(),
    onPoolChange: fn(),
    onLanguageChange: fn(),
  },
  render: (args, context) => {
    const language = storyLanguage(context.globals.locale);
    return (
      <InteractiveSplashscreen
        {...args}
        key={`${language}-${args.pool.join("-")}`}
        language={language}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof Splashscreen>;

export const EmptySelection: Story = {
  play: async ({ canvas, globals, userEvent }) => {
    const t = getTranslations(storyLanguage(globals.locale));
    for (const player of PLAYERS.slice(0, 5)) {
      await userEvent.click(canvas.getByRole("button", { name: player }));
    }
    await expect(canvas.getByText(t.splash.selectedCount(0))).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: PLAYERS[0] })).toBeVisible();
  },
};

export const IncompleteSelection: Story = {
  play: async ({ canvas, globals, userEvent }) => {
    const t = getTranslations(storyLanguage(globals.locale));
    await userEvent.click(canvas.getByRole("button", { name: PLAYERS[0] }));
    await expect(canvas.getByText(t.splash.selectedCount(4))).toBeInTheDocument();
  },
};

export const ReadyToStart: Story = {
  play: async ({ args, canvas, globals, userEvent }) => {
    const language = storyLanguage(globals.locale);
    const t = getTranslations(language);
    await userEvent.click(canvas.getByRole("button", { name: t.splash.start }));
    await expect(args.onStart).toHaveBeenCalledWith(PLAYERS.slice(0, 5));
  },
};

export const OverSelected: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: PLAYERS[5] }));
    await expect(canvas.getByText(/6\/5/)).toBeInTheDocument();
  },
};

export const WithCustomPlayer: Story = {
  args: {
    pool: ["Robin", ...PLAYERS],
  },
};

export const AddCustomPlayer: Story = {
  play: async ({ args, canvas, globals, userEvent }) => {
    const t = getTranslations(storyLanguage(globals.locale));
    await userEvent.type(
      canvas.getByPlaceholderText(t.splash.addPlayerPlaceholder),
      "Robin",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: t.splash.addPlayer }),
    );
    await expect(args.onPoolChange).toHaveBeenCalledWith([
      ...PLAYERS,
      "Robin",
    ]);
    await expect(canvas.getByRole("button", { name: "Robin" })).toBeVisible();
  },
};
