import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../components/ui/Button";
import { RefreshCw, RotateCcw, BarChart3 } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: (
      <>
        <RefreshCw size={18} /> Nächster Wechsel
      </>
    ),
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: (
      <>
        <BarChart3 size={18} /> Statistik
      </>
    ),
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: (
      <>
        <RotateCcw size={18} /> Reset
      </>
    ),
  },
};

export const Large: Story = {
  args: {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    children: (
      <>
        <RefreshCw size={24} /> Nächster Wechsel
      </>
    ),
  },
};
