import type { Meta, StoryObj } from "@storybook/react-vite";
import { TennisMixer } from "../components/TennisMixer/TennisMixer";
import { PLAYERS } from "../lib/tennis";
import type { GameState } from "../lib/types";
import { storyLanguage } from "./storybook";

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

function makeState(): GameState {
  return {
    home: ["Teja", "Nic"],
    guest: ["Benni", "Alex"],
    bench: ["Andre"],
    playCount: { Teja: 1, Nic: 1, Benni: 1, Alex: 1, Andre: 0 },
    benchCount: { Teja: 0, Nic: 0, Benni: 0, Alex: 0, Andre: 1 },
    serveCount: { Teja: 1, Nic: 0, Benni: 0, Alex: 0, Andre: 0 },
    partnerCount: { "Nic|Teja": 1, "Alex|Benni": 1 },
    opponentCount: {
      "Alex|Nic": 1,
      "Alex|Teja": 1,
      "Benni|Nic": 1,
      "Benni|Teja": 1,
    },
    round: 1,
    lastIn: null,
    lastChange: null,
    ts: 1000,
  };
}

function makeState6Players(): GameState {
  return {
    home: ["Teja", "Nic"],
    guest: ["Benni", "Alex"],
    bench: ["Andre", "Fidschi"],
    playCount: { Teja: 1, Nic: 1, Benni: 1, Alex: 1, Andre: 0, Fidschi: 0 },
    benchCount: { Teja: 0, Nic: 0, Benni: 0, Alex: 0, Andre: 1, Fidschi: 1 },
    serveCount: { Teja: 1, Nic: 0, Benni: 0, Alex: 0, Andre: 0, Fidschi: 0 },
    partnerCount: { "Nic|Teja": 1, "Alex|Benni": 1 },
    opponentCount: {
      "Alex|Nic": 1,
      "Alex|Teja": 1,
      "Benni|Nic": 1,
      "Benni|Teja": 1,
    },
    round: 1,
    lastIn: null,
    lastChange: null,
    ts: 1000,
  };
}

export const Splash: Story = {
  render: (_, context) => {
    const language = storyLanguage(context.globals.locale);
    return (
      <TennisMixer
        key={`splash-${language}`}
        initialState={null}
        initialPlayerPool={[...PLAYERS]}
        initialLanguage={language}
      />
    );
  },
};

export const ActiveGame: Story = {
  render: (_, context) => {
    const language = storyLanguage(context.globals.locale);
    return (
      <TennisMixer
        key={`game-${language}`}
        initialState={makeState()}
        initialLanguage={language}
      />
    );
  },
};

export const ActiveGame6Players: Story = {
  render: (_, context) => {
    const language = storyLanguage(context.globals.locale);
    return (
      <TennisMixer
        key={`game6-${language}`}
        initialState={makeState6Players()}
        initialLanguage={language}
      />
    );
  },
};
