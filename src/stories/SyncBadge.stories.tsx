import type { Meta, StoryObj } from "@storybook/react-vite";
import { SyncBadge } from "../components/TennisMixer/SyncBadge";
import { storyLanguage } from "./storybook";

const meta: Meta<typeof SyncBadge> = {
  title: "TennisMixer/SyncBadge",
  component: SyncBadge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  render: (args, context) => (
    <SyncBadge
      {...args}
      language={storyLanguage(context.globals.locale)}
    />
  ),
};

export default meta;
type Story = StoryObj<typeof SyncBadge>;

export const Local: Story = {
  args: { mode: "local" },
};

export const Shared: Story = {
  args: { mode: "shared" },
};
