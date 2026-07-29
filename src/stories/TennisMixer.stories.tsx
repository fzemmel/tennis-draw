import type { Meta, StoryObj } from "@storybook/react-vite";
import { TennisMixer } from "../components/TennisMixer/TennisMixer";
import type { GameState } from "../lib/types";

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

const STORAGE_KEY = "tennis_state_v1";
const LANGUAGE_KEY = "tennis_language_v1";

function makeState(): GameState {
  return {
    home: ["Teja", "Nic"],
    guest: ["Benni", "Alex"],
    bench: "Andre",
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

function prepareStory(language: string, activeGame: boolean) {
  localStorage.clear();
  localStorage.setItem(LANGUAGE_KEY, language);

  if (activeGame) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeState()));
  }
}

export const Splash: Story = {
  render: (_, context) => {
    prepareStory(context.globals.locale as string, false);
    return <TennisMixer key={`splash-${context.globals.locale as string}`} />;
  },
};

export const ActiveGame: Story = {
  render: (_, context) => {
    prepareStory(context.globals.locale as string, true);
    return <TennisMixer key={`game-${context.globals.locale as string}`} />;
  },
};
