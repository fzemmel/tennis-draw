import type { Meta, StoryObj } from "@storybook/react-vite";
import { BenchDisplay } from "../components/TennisMixer/BenchDisplay";
import { storyLanguage } from "./storybook";

const meta: Meta<typeof BenchDisplay> = {
  title: "TennisMixer/BenchDisplay",
  component: BenchDisplay,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[360px] text-slate-50">
        <Story />
      </div>
    ),
  ],
  render: (args, context) => (
    <BenchDisplay
      {...args}
      language={storyLanguage(context.globals.locale)}
    />
  ),
};

export default meta;
type Story = StoryObj<typeof BenchDisplay>;

export const Default: Story = {
  args: {
    player: "Andre",
  },
};
