import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../components/ui/Button";
import { RefreshCw, RotateCcw, BarChart3 } from "lucide-react";
import { getTranslations } from "../lib/i18n";
import { storyLanguage } from "./storybook";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Button>;

function localizedLabel(
  locale: unknown,
  key: "nextChange" | "stats" | "reset",
) {
  const t = getTranslations(storyLanguage(locale));
  return t[key];
}

export const Primary: Story = {
  render: (_, context) => (
    <Button variant="primary">
      <>
        <RefreshCw size={18} />{" "}
        {localizedLabel(context.globals.locale, "nextChange")}
      </>
    </Button>
  ),
};

export const Secondary: Story = {
  render: (_, context) => (
    <Button variant="secondary">
      <>
        <BarChart3 size={18} />{" "}
        {localizedLabel(context.globals.locale, "stats")}
      </>
    </Button>
  ),
};

export const Danger: Story = {
  render: (_, context) => (
    <Button variant="danger">
      <>
        <RotateCcw size={18} />{" "}
        {localizedLabel(context.globals.locale, "reset")}
      </>
    </Button>
  ),
};

export const Large: Story = {
  render: (_, context) => (
    <Button variant="primary" size="lg" fullWidth>
      <>
        <RefreshCw size={24} />{" "}
        {localizedLabel(context.globals.locale, "nextChange")}
      </>
    </Button>
  ),
};
