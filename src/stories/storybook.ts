import {
  DEFAULT_LANGUAGE,
  isLanguage,
  type Language,
} from "../lib/i18n";

export function storyLanguage(value: unknown): Language {
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}
