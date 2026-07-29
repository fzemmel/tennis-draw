import type { Meta, StoryObj } from "@storybook/react-vite";
import { TeamCard } from "../components/TennisMixer/TeamCard";
import type { Language } from "../lib/i18n";

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
      language={context.globals.locale as Language}
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
    incomingName: undefined,
  },
};

export const Guest: Story = {
  args: {
    title: "GAST",
    players: ["Alex", "Benni"],
    serverName: "Benni",
    incomingName: "Alex",
  },
};

export const WithIncomingPlayer: Story = {
  name: "With incoming player badge",
  args: {
    title: "HEIM",
    players: ["Teja", "Nic"],
    serverName: "Nic",
    incomingName: "Teja",
  },
};
