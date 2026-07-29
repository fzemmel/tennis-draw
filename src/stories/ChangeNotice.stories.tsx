import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChangeNotice } from "../components/TennisMixer/ChangeNotice";
import { storyLanguage } from "./storybook";

const meta: Meta<typeof ChangeNotice> = {
  title: "TennisMixer/ChangeNotice",
  component: ChangeNotice,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
  render: (args, context) => (
    <ChangeNotice
      {...args}
      language={storyLanguage(context.globals.locale)}
    />
  ),
};

export default meta;
type Story = StoryObj<typeof ChangeNotice>;

export const HomeChange: Story = {
  args: {
    changes: [{ in: "Andre", out: "Nic", team: "HEIM" }],
  },
};

export const GuestChange: Story = {
  args: {
    changes: [{ in: "Teja", out: "Benni", team: "GAST" }],
  },
};

export const DoubleChange: Story = {
  args: {
    changes: [
      { in: "Andre", out: "Nic", team: "HEIM" },
      { in: "Fidschi", out: "Alex", team: "GAST" },
    ],
  },
};
