import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartnerMatrix } from "../components/TennisMixer/PartnerMatrix";
import { pairKey } from "../lib/tennis";
import { storyLanguage } from "./storybook";

const players = ["Teja", "Nic", "Benni", "Alex", "Andre"];

const meta: Meta<typeof PartnerMatrix> = {
  title: "TennisMixer/PartnerMatrix",
  component: PartnerMatrix,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[380px] rounded-xl bg-slate-800 p-4 text-slate-50">
        <Story />
      </div>
    ),
  ],
  render: (args, context) => (
    <PartnerMatrix
      {...args}
      language={storyLanguage(context.globals.locale)}
    />
  ),
};

export default meta;
type Story = StoryObj<typeof PartnerMatrix>;

export const WithHistory: Story = {
  args: {
    players,
    partnerCount: {
      [pairKey("Teja", "Nic")]: 3,
      [pairKey("Benni", "Alex")]: 2,
      [pairKey("Teja", "Andre")]: 1,
    },
  },
};

export const NoHistory: Story = {
  args: {
    players,
    partnerCount: {},
  },
};
