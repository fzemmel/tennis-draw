import { getTranslations, type Language } from "../../lib/i18n";
import type { ChangeEvent } from "../../lib/types";

interface ChangeNoticeProps {
  changes: ChangeEvent[];
  language: Language;
}

export function ChangeNotice({ changes, language }: ChangeNoticeProps) {
  const t = getTranslations(language);

  return (
    <div className="bg-sky-600 text-white rounded-xl px-3.5 py-2.5 text-center font-bold text-base space-y-0.5">
      {changes.map((change, i) => (
        <div key={i}>{t.changeNotice(change)}</div>
      ))}
    </div>
  );
}
