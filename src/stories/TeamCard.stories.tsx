import type { Meta, StoryObj } from "@storybook/react-vite";
import { TeamCard } from "../components/TennisMixer/TeamCard";
import { storyLanguage } from "./storybook";

const meta: Meta<typeof TeamCard> = {
  title: "TennisMixer/TeamCard",
  component: TeamCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="flex gap-4 p-4 w-[340px]">
        <Story />
      </div>
    ),
  ],
  render: (args, context) => (
    <TeamCard
      {...args}
      language={storyLanguage(context.globals.locale)}
    />
  ),
};

export default meta;
type Story = StoryObj<typeof TeamCard>;

export const Home: Story = {
  args: {
    title: "HEIM",
    players: ["Fidschi", "Nic"],
    serverName: "Fidschi",
    incomingNames: [],
  },
};

export const Guest: Story = {
  args: {
    title: "GAST",
    players: ["Alex", "Benni"],
    serverName: "Benni",
    incomingNames: ["Alex"],
  },
};

export const WithIncomingPlayer: Story = {
  name: "With incoming player badge",
  args: {
    title: "HEIM",
    players: ["Teja", "Nic"],
    serverName: "Nic",
    incomingNames: ["Teja"],
  },
};

export const WithTwoIncomingPlayers: Story = {
  name: "With two incoming players (double sub)",
  args: {
    title: "HEIM",
    players: ["Teja", "Nic"],
    serverName: "Nic",
    incomingNames: ["Teja", "Nic"],
  },
};
