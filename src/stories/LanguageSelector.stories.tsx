import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { LanguageSelector } from "../components/TennisMixer/LanguageSelector";
import { getTranslations, type Language } from "../lib/i18n";
import { storyLanguage } from "./storybook";

interface InteractiveLanguageSelectorProps {
  initialLanguage: Language;
  onChange: (language: Language) => void;
}

function InteractiveLanguageSelector({
  initialLanguage,
  onChange,
}: InteractiveLanguageSelectorProps) {
  const [language, setLanguage] = useState(initialLanguage);

  function handleChange(nextLanguage: Language) {
    setLanguage(nextLanguage);
    onChange(nextLanguage);
  }

  return <LanguageSelector language={language} onChange={handleChange} />;
}

const meta: Meta<typeof LanguageSelector> = {
  title: "TennisMixer/LanguageSelector",
  component: LanguageSelector,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    onChange: fn(),
  },
  render: (args, context) => {
    const language = storyLanguage(context.globals.locale);
    return (
      <InteractiveLanguageSelector
        key={language}
        initialLanguage={language}
        onChange={args.onChange}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof LanguageSelector>;

export const Default: Story = {};

export const SwitchLanguage: Story = {
  play: async ({ args, canvas, globals, userEvent }) => {
    const language = storyLanguage(globals.locale);
    const nextLanguage = language === "de" ? "en" : "de";
    const t = getTranslations(language);
    await userEvent.click(
      canvas.getByRole("button", {
        name: t.languageSelector.switchTo(nextLanguage),
      }),
    );
    await expect(args.onChange).toHaveBeenCalledWith(nextLanguage);
  },
};
