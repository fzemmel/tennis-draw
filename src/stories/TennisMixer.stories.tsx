import type { Meta, StoryObj } from "@storybook/react-vite";
import { TennisMixer } from "../components/TennisMixer/TennisMixer";

const meta: Meta<typeof TennisMixer> = {
  title: "TennisMixer/TennisMixer",
  component: TennisMixer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof TennisMixer>;

export const Default: Story = {};
