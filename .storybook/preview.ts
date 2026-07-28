import type { Preview } from "@storybook/react-vite";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        dark: { name: "dark", value: "#0f172a" },
        light: { name: "light", value: "#f8fafc" }
      }
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  initialGlobals: {
    backgrounds: {
      value: "dark"
    }
  }
};

export default preview;
