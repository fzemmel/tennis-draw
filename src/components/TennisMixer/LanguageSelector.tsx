import { getTranslations, type Language } from "../../lib/i18n";

interface LanguageSelectorProps {
  language: Language;
  onChange: (language: Language) => void;
  className?: string;
}

const languageOptions: Language[] = ["de", "en"];

export function LanguageSelector({
  language,
  onChange,
  className = "",
}: LanguageSelectorProps) {
  const t = getTranslations(language);

  return (
    <div
      className={["inline-flex items-center gap-2", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={t.languageSelector.label}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {t.languageSelector.label}
      </span>
      <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 p-1">
        {languageOptions.map((option) => {
          const isActive = option === language;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-label={t.languageSelector.switchTo(option)}
              aria-pressed={isActive}
              className={[
                "rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide transition-colors",
                isActive
                  ? "bg-green-500 text-white"
                  : "text-slate-300 hover:bg-slate-800",
              ].join(" ")}
            >
              {option.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
