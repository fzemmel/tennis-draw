import type { ChangeEvent } from "../../lib/types";

interface ChangeNoticeProps {
  change: ChangeEvent;
}

export function ChangeNotice({ change }: ChangeNoticeProps) {
  return (
    <div className="bg-sky-600 text-white rounded-xl px-3.5 py-2.5 text-center font-bold text-base">
      🔄 {change.in} kommt rein für {change.out} ({change.team})
    </div>
  );
}
