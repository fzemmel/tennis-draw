import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatTable } from "../components/TennisMixer/StatTable";
import { storyLanguage } from "./storybook";

const meta: Meta<typeof StatTable> = {
  title: "TennisMixer/StatTable",
  component: StatTable,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="bg-slate-800 rounded-xl p-4 w-[360px]">
        <Story />
      </div>
    ),
  ],
  render: (args, context) => (
    <StatTable
      {...args}
      language={storyLanguage(context.globals.locale)}
    />
  ),
};

export default meta;
type Story = StoryObj<typeof StatTable>;

export const Default: Story = {
  args: {
    rows: [
      { name: "Fidschi", play: 5, bench: 1, serve: 2 },
      { name: "Nic", play: 4, bench: 2, serve: 1 },
      { name: "Alex", play: 5, bench: 1, serve: 2 },
      { name: "Benni", play: 4, bench: 2, serve: 1 },
      { name: "Teja", play: 3, bench: 3, serve: 1 },
    ],
  },
};
