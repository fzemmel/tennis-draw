import type { Meta, StoryObj } from "@storybook/react";
import { TeamCard } from "../components/TennisMixer/TeamCard";

const meta: Meta<typeof TeamCard> = {
  title: "TennisMixer/TeamCard",
  component: TeamCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="flex gap-4 p-4" style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TeamCard>;

export const Heim: Story = {
  args: {
    title: "HEIM",
    players: ["Fidschi", "Nic"],
    serverName: "Fidschi",
    incomingName: undefined,
  },
};

export const Gast: Story = {
  args: {
    title: "GAST",
    players: ["Alex", "Benni"],
    serverName: "Benni",
    incomingName: "Alex",
  },
};

export const MitNeuemSpieler: Story = {
  name: "Mit neuem Spieler (NEU-Badge)",
  args: {
    title: "HEIM",
    players: ["Teja", "Nic"],
    serverName: "Nic",
    incomingName: "Teja",
  },
};
