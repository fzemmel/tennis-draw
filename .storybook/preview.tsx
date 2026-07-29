import type { Preview } from "@storybook/react-vite";
import { DEFAULT_LANGUAGE, isLanguage } from "../src/lib/i18n";
import "../src/index.css";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const locale = isLanguage(context.globals.locale)
        ? context.globals.locale
        : DEFAULT_LANGUAGE;
      document.documentElement.lang = locale;
      return <Story />;
    },
  ],
  globalTypes: {
    locale: {
      name: "Locale",
      description: "UI language",
      toolbar: {
        icon: "globe",
        items: [
          { value: "de", title: "German" },
          { value: "en", title: "English" },
        ],
      },
    },
  },
  parameters: {
    backgrounds: {
      options: {
        dark: { name: "dark", value: "#0f172a" },
        light: { name: "light", value: "#f8fafc" },
      },
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
      value: "dark",
    },
    locale: "de",
  },
};

export default preview;
